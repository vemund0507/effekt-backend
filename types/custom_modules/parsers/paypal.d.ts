export type PaypalTransaction = {
    date: moment.Moment;
    transactionID: string;
    referenceTransactionID: string;
    amount: number;
    email: string;
};
import moment = require("moment");
declare function parse(report: Buffer): PaypalTransaction[];
export {};
