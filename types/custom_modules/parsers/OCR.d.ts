export type Transaction = {
    transactionCode: number;
    recordType: number;
    serviceCode: number;
    amount: number;
    transactionID: string;
    date: Date;
    KID: number;
};
declare function parse(data: string): Transaction[];
declare function parseLine(line: any, nextline: any): Transaction;
export {};
