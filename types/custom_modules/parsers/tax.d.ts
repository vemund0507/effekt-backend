export type TaxDeductionRecord = {
    fullname: string;
    firstname: string;
    email: string;
    ssn: string;
    amount: string;
};
declare function parseReport(report: Buffer): TaxDeductionRecord[];
export {};
