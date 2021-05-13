export type BankCustomTransactions = {
    message: string;
    amount: number;
    KID: string;
    date: moment.Moment;
    externalRef: string;
};
import moment = require("moment");
declare function parseReport(report: Buffer): BankCustomTransactions[];
declare function parseRow(row: string[]): BankCustomTransactions;
export {};
