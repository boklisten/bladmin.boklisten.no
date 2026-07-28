import { Component, OnInit } from "@angular/core";
import { CustomerItemService, InvoiceService } from "@boklisten/bl-connect";
import { InvoiceGeneratorService } from "./invoice-generator.service";
import { Invoice, CustomerItemType } from "@boklisten/bl-model";

@Component({
	selector: "app-invoice-generator",
	templateUrl: "./invoice-generator.component.html",
	styleUrls: ["./invoice-generator.component.scss"],
})
export class InvoiceGeneratorComponent implements OnInit {
	public invoices: Invoice[];
	public period: { fromDate: Date; toDate: Date };
	public invoiceNumber: number;
	public reference: string;
	public fee: number;
	public feePercentage: number;
	public daysToDeadline: number;
	public wait: boolean;
	public waitAdd: boolean;
	public customerItemType: CustomerItemType;
	public feeVatPercentage: number;

	constructor(
		customerItemService: CustomerItemService,
		private invoiceGeneratorService: InvoiceGeneratorService,
		private invoiceService: InvoiceService
	) {
		this.invoiceNumber = 20190000;
		this.invoices = [];
		this.fee = 75;
		this.feePercentage = 1.1;
		this.daysToDeadline = 14;
		this.feeVatPercentage = 0.25;
	}

	ngOnInit() {
		this.invoices = this.invoiceGeneratorService.getCurrentUnsavedInvoices();
	}

	public onTypeSelect(customerItemType: CustomerItemType) {
		this.customerItemType = customerItemType;

		if (customerItemType === "partly-payment") {
			this.fee = 120;
			this.feePercentage = 0.33;
			this.reference = "Manglende delbetaling av skolebøker";
		} else {
			this.fee = 72;
			this.feePercentage = 1.1;
			this.reference = "Manglende levering av skolebøker";
		}
	}

	public createInvoices() {
		this.wait = true;
		this.invoiceGeneratorService
			.createInvoices(
				{
					fee: this.fee,
					feePercentage: this.feePercentage,
					daysToDeadline: this.daysToDeadline,
					feeVatPercentage: this.feeVatPercentage,
				},
				this.customerItemType,
				this.reference,
				this.invoiceNumber,
				this.period
			)
			.then((invoices) => {
				this.wait = false;
				this.invoices = invoices;
				this.invoiceGeneratorService.setUnsavedInvoices(invoices);
			})
			.catch((err) => {
				this.wait = false;
				console.log("could not create invoices", err);
			});
	}

	public addInvoices() {
		this.waitAdd = true;
		this.invoiceGeneratorService
			.addInvoices(this.invoices)
			.then((addedInvoices) => {
				this.waitAdd = false;
				if (addedInvoices.length === this.invoices.length) {
					this.invoices = [];
				}
			})
			.catch((err) => {
				this.waitAdd = false;
				console.log("could not add invoices", err);
			});
	}

	public onPeriodChange(period) {
		this.period = period;
	}
}
