import { Injectable } from "@angular/core";
import {
	CustomerItem,
	CustomerItemType,
	Invoice,
	Item,
	UserDetail,
} from "@boklisten/bl-model";
import { DateService } from "../../date/date.service";
import {
	InvoiceService,
	ItemService,
	UserDetailService,
} from "@boklisten/bl-connect";
import { CustomerItemHandlerService } from "../../customer-item/customer-item-handler/customer-item-handler.service";
import { PriceService } from "../../price/price.service";
import { CustomerItemPriceService } from "../../price/customer-item-price/customer-item-price.service";

@Injectable({
	providedIn: "root",
})
export class InvoiceGeneratorService {
	private unsavedInvoices: Invoice[];
	private feePercentage: number;
	private feeVatPercentage: number;
	private fee: number;
	private daysToDeadline: number;

	constructor(
		private invoiceService: InvoiceService,
		private customerItemHandlerService: CustomerItemHandlerService,
		private userDetailService: UserDetailService,
		private itemService: ItemService,
		private priceService: PriceService,
		private customerItemPriceService: CustomerItemPriceService,
		private dateService: DateService
	) {
		this.feePercentage = 1.1;
		this.feeVatPercentage = 0.25;
		this.fee = 75;
		this.daysToDeadline = 14;
	}

	public createCompanyInvoice() {}

	/**
	 * Creates invoices based on customerItems not delivered on a set deadline
	 */
	public async createInvoices(
		settings: {
			feePercentage: number;
			fee: number;
			daysToDeadline: number;
			feeVatPercentage: number;
		},
		customerItemType: CustomerItemType,
		reference: string,
		invoiceNumber: number,
		period: { fromDate: Date; toDate: Date }
	): Promise<Invoice[]> {
		this.fee = settings.fee;
		this.feePercentage = settings.feePercentage;
		this.feeVatPercentage = settings.feeVatPercentage;
		this.daysToDeadline = settings.daysToDeadline;

		const notReturnedCustomerItems = await this.customerItemHandlerService.getNotReturnedCustomerItems(
			customerItemType,
			[],
			period.fromDate,
			period.toDate
		);

		const groupedCustomerItems = this.groupCustomerItemsByCustomer(
			notReturnedCustomerItems
		);

		const generatedInvoices = await this.generateInvoices(
			reference,
			invoiceNumber,
			customerItemType,
			groupedCustomerItems
		);

		return Promise.resolve(generatedInvoices);
	}

	public async addInvoices(invoices: Invoice[]): Promise<Invoice[]> {
		return Promise.all(
			invoices.map((invoice) => this.invoiceService.add(invoice))
		);
	}

	public setUnsavedInvoices(invoices: Invoice[]) {
		this.unsavedInvoices = invoices;
	}

	public getCurrentUnsavedInvoices(): Invoice[] {
		return this.unsavedInvoices;
	}

	private groupCustomerItemsByCustomer(
		customerItems: CustomerItem[]
	): { customer: string; customerItems: CustomerItem[] }[] {
		// Group customers with thir respective customerItems
		const customersAndCustomerItems = {};
		for (const customerItem of customerItems) {
			customersAndCustomerItems[customerItem.customer as string] ??= [];
			customersAndCustomerItems[customerItem.customer as string].push(
				customerItem
			);
		}

		// Put everything in an array
		return Object.keys(customersAndCustomerItems).map((customer) => ({
			customer: customer,
			customerItems: customersAndCustomerItems[customer],
		}));
	}

	private async generateInvoices(
		reference: string,
		invoiceNumber: number,
		customerItemType: CustomerItemType,
		customersWithCustomerItems: {
			customer: string | UserDetail;
			customerItems: CustomerItem[];
		}[]
	): Promise<Invoice[]> {
		const duedate = this.dateService.addDays(
			new Date(),
			this.daysToDeadline
		);

		return await Promise.all(
			customersWithCustomerItems.map(async (customerWithCustomerItem) => {
				await Promise.all(
					customerWithCustomerItem.customerItems.map(
						async (customerItem) => {
							// @ts-ignore
							customerItem.item = await this.itemService.getById(
								customerItem.item as string
							);
						}
					)
				);
				customerWithCustomerItem.customer = await this.userDetailService.getById(
					customerWithCustomerItem.customer as string
				);
				const currentInvoiceNumber = invoiceNumber;
				invoiceNumber += 1;
				return await this.convertToInvoice(
					reference,
					currentInvoiceNumber,
					duedate,
					customerItemType,
					customerWithCustomerItem.customer,
					customerWithCustomerItem.customerItems
				);
			})
		);
	}

	private async convertToInvoice(
		reference: string,
		invoiceNumber: number,
		duedate: Date,
		customerItemType: CustomerItemType,
		userDetail: UserDetail,
		customerItems: CustomerItem[]
	): Promise<Invoice> {
		const branch =
			userDetail.branch !== undefined
				? userDetail.branch
				: customerItems[0].handoutInfo &&
				  customerItems[0].handoutInfo["handoutById"]
				? customerItems[0].handoutInfo["handoutById"]
				: "";
		let invoice = {
			duedate: duedate,
			customerHavePayed: false,
			branch: branch,
			type: customerItemType,
			customerItemPayments: await this.createCustomerItemPayments(
				customerItems
			),
			customerInfo: {
				userDetail: userDetail.id,
				name: userDetail.name,
				email: userDetail.email,
				phone: userDetail.phone,
				dob: userDetail.dob,
				postal: {
					address: userDetail.address,
					city: userDetail.postCity,
					code: userDetail.postCode,
					country: userDetail.country,
				},
			},
			payment: {
				total: {
					gross: 0,
					net: 0,
					vat: 0,
					discount: 0,
				},
				fee: {
					unit: 0,
					gross: 0,
					net: 0,
					vat: 0,
					discount: 0,
				},
				totalIncludingFee: 0,
			},
			reference: reference,
			invoiceId: invoiceNumber.toString(),
		} as Invoice;

		invoice = this.calculateFeePayment(invoice);
		invoice = this.calculateTotalPayment(invoice);

		invoice.payment.totalIncludingFee = invoice.payment.total.gross;

		this.validateInvoiceAmounts(invoice);

		return invoice;
	}

	/**
	 * An amount that is not a number is stored as null, since that is what
	 * JSON.stringify makes of NaN. Null amounts are exported as 0 to Visma,
	 * which silently gives wrong invoices, so refuse to create the invoice
	 * instead.
	 */
	private validateInvoiceAmounts(invoice: Invoice) {
		const amounts = [
			...invoice.customerItemPayments.map((customerItemPayment) => ({
				label: customerItemPayment.title,
				payment: customerItemPayment.payment,
			})),
			{ label: "fee", payment: invoice.payment.fee },
			{ label: "total", payment: invoice.payment.total },
		];

		const invalidAmounts = amounts
			.map(({ label, payment }) => ({
				label,
				invalidFields: Object.keys(payment).filter(
					(field) => !Number.isFinite(payment[field])
				),
			}))
			.filter(({ invalidFields }) => invalidFields.length > 0);

		if (invalidAmounts.length > 0) {
			throw new Error(
				`invoice ${invoice.invoiceId} for ${
					invoice.customerInfo.name
				} has invalid amounts: ${invalidAmounts
					.map(
						({ label, invalidFields }) =>
							`${label} (${invalidFields.join(", ")})`
					)
					.join(", ")}`
			);
		}
	}

	private async createCustomerItemPayments(
		customerItems: CustomerItem[]
	): Promise<any[]> {
		const customerItemPayments = [];

		for (const customerItemObj of customerItems) {
			// @ts-ignore
			const item = customerItemObj.item as Item;
			customerItemPayments.push({
				customerItem: customerItemObj.id,
				customerItemType: customerItemObj.type,
				title: item.title,
				item: item.id,
				numberOfItems: 1,
				payment: await this.createCustomerItemInvoicePayment(
					customerItemObj,
					item
				),
			});
		}

		return customerItemPayments;
	}

	private async createCustomerItemInvoicePayment(
		customerItem: CustomerItem,
		item: Item
	): Promise<{
		unit: number;
		gross: number;
		net: number;
		vat: number;
		discount: number;
	}> {
		if (customerItem.type === "partly-payment") {
			// `customerItem.amountLeftToPay` is 0 for items moved between orders,
			// so compute the buyout amount dynamically (same logic as buyout).
			const amountLeftToPay = await this.customerItemPriceService.calculatePartlyPaymentBuyoutAmount(
				customerItem,
				item
			);
			return {
				unit: amountLeftToPay,
				gross: amountLeftToPay,
				net: amountLeftToPay,
				vat: 0,
				discount: 0,
			};
		}
		return {
			unit: this.itemUnitPrice(item),
			gross: this.itemGrossPrice(item),
			net: this.itemNetPrice(item),
			vat: this.itemVatPrice(),
			discount: this.itemDiscountPrice(item),
		};
	}

	private calculateTotalPayment(invoice: Invoice) {
		for (const customerItemPayment of invoice.customerItemPayments) {
			invoice.payment.total.gross += customerItemPayment.payment.gross;
			invoice.payment.total.net += customerItemPayment.payment.net;
			invoice.payment.total.vat += customerItemPayment.payment.vat;
		}

		invoice.payment.total.gross += invoice.payment.fee.gross;
		invoice.payment.total.net += invoice.payment.fee.net;
		invoice.payment.total.vat += invoice.payment.fee.vat;

		return invoice;
	}

	private calculateFeePayment(invoice: Invoice) {
		invoice.payment.fee.unit = this.fee;
		invoice.payment.fee.net = this.priceService.toFixed(
			invoice.customerItemPayments.length * this.fee
		);
		invoice.payment.fee.vat = this.priceService.toFixed(
			invoice.payment.fee.net * this.feeVatPercentage
		);
		invoice.payment.fee.gross =
			invoice.payment.fee.net + invoice.payment.fee.vat;
		return invoice;
	}

	private itemUnitPrice(item: Item): number {
		return item.price;
	}

	private itemGrossPrice(item: Item): number {
		return this.priceService.toFixed(item.price * this.feePercentage);
	}

	private itemNetPrice(item: Item): number {
		return this.itemGrossPrice(item) - this.itemVatPrice();
	}

	/**
	 * Books are exempt from VAT in the last sales link, both when sold and
	 * when rented out (mval. § 6-4), so item lines never carry VAT.
	 *
	 * This used to be calculated from `item.taxRate`, but that field was
	 * removed from the API. Multiplying by `undefined` gave NaN, which was
	 * stored as null and exported as 0 in the Visma net field.
	 */
	private itemVatPrice(): number {
		return 0;
	}

	private itemDiscountPrice(item: Item): number {
		return 0;
	}
}
