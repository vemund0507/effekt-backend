export function createDonationSplitArray(passedOrganizations: any): Promise<{
    organizationID: any;
    share: any;
    name: any;
}[]>;
export function getStandardSplit(): Promise<any>;
export function createKID(): Promise<number>;
