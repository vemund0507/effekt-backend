export const donors: {
    getByID: (ID: number) => import("./DAO_modules/donors").Donor;
    getIDbyEmail: (email: string) => number;
    getByKID: (KID: number) => import("./DAO_modules/donors").Donor;
    search: (query: string) => import("./DAO_modules/donors").Donor[];
    add: (email: string, name: any, ssn?: string, newsletter?: any) => number;
    updateSsn: (donorID: number, ssn: string) => boolean;
    updateNewsletter: (donorID: number, newsletter: boolean) => boolean;
    setup: (dbPool: any) => void;
};
export const organizations: {
    getByIDs: (IDs: number[]) => any[];
    getByID: (ID: number) => any;
    getActive: () => any[];
    getAll: () => any[];
    getStandardSplit: () => Promise<any>;
    setup: (dbPool: any) => void;
};
export const donations: {
    getAll: (sort: any, page: any, limit?: number, filter?: any) => [any[], string];
    getByID: (donationID: any) => import("./DAO_modules/donations").Donation;
    getAggregateByTime: (startTime: Date, endTime: Date) => any[];
    getFromRange: (fromDate?: Date, toDate?: Date, paymentMethodIDs?: any[]) => Promise<Map<any, any>>;
    getMedianFromRange: (fromDate?: Date, toDate?: Date) => number;
    getHasReplacedOrgs: (donationID: number) => number;
    getSummary: (donorID: number) => import("./DAO_modules/donations").DonationSummary[];
    getSummaryByYear: (donorID: number) => any[];
    getHistory: (donorID: number) => import("./DAO_modules/donations").DonationDistributions[];
    ExternalPaymentIDExists: (externalPaymentID: any, paymentID: any) => Promise<boolean>;
    add: (KID: number, paymentMethodID: number, sum: number, registeredDate?: Date, externalPaymentID?: string, metaOwnerID?: number) => number;
    registerConfirmedByIDs: (IDs: any) => Promise<boolean>;
    getHistogramBySum: () => any[];
    remove: (donationId: number) => boolean;
    setup: (dbPool: any, DAOObject: any) => void;
};
export const distributions: {
    KIDexists: (KID: number) => boolean;
    getKIDbySplit: (split: any, donorID: number) => number;
    getSplitByKID: (KID: number) => [{
        ID: number;
        full_name: string;
        abbriv: string;
        percentage_share: import("decimal.js").default;
    }];
    getHistoricPaypalSubscriptionKIDS: (referenceIDs: any) => any;
    getAll: (page: number, limit: number, sort: any, filter?: any) => Promise<{
        rows: any;
        pages: number;
    }>;
    getAllByDonor: (donorID: number) => {
        donorID: number;
        distributions: [{
            KID: number;
            organizations: [{
                name: string;
                share: number;
            }];
        }];
    };
    add: (split: any[], KID: number, donorID: number, metaOwnerID?: number) => Promise<boolean>;
    setup: (dbPool: any, DAOObject: any) => void;
};
export const payment: {
    getMethods: () => any[];
    getPaymentMethodsByIDs: (paymentMethodIDs: any) => any[];
    setup: (dbPool: any) => void;
};
export const vipps: {
    getLatestToken: () => boolean | import("./DAO_modules/vipps").VippsToken;
    getOrder: (orderID: any) => false | import("./DAO_modules/vipps").VippsOrder;
    getRecentOrder: () => false | import("./DAO_modules/vipps").VippsOrder;
    addToken: (token: import("./DAO_modules/vipps").VippsToken) => number;
    addOrder: (order: import("./DAO_modules/vipps").VippsOrder) => number;
    updateOrderTransactionStatusHistory: (orderId: string, transactionHistory: import("./DAO_modules/vipps").VippsTransactionLogItem[]) => boolean;
    updateVippsOrderDonation: (orderID: string, donationID: number) => boolean;
    setup: (dbPool: any) => void;
};
export const csr: {
    getAllDonationsByDonorId: (donorId: any) => Promise<number>;
    setup: (dbPool: any) => void;
};
export const parsing: {
    getVippsParsingRules: (periodStart: Date, periodEnd: Date) => any[];
    setup: (dbPool: any) => void;
};
export const referrals: {
    getTypes: () => import("./DAO_modules/referrals").ReferralType[];
    getAggregate: () => import("./DAO_modules/referrals").ReferralTypeAggregate[];
    getDonorAnswered: (donorID: number) => Promise<boolean>;
    addRecord: (referralTypeID: number, donorID: number, otherComment: string) => Promise<boolean>;
    setup: (dbPool: any) => void;
};
export const auth: {
    getDonorByChangePassToken: (token: string) => any;
    getCheckPermissionByToken: (token: string, permission: string) => number;
    getApplicationByClientID: (clientID: string) => any;
    getPermissionsFromShortnames: (shortnames: any[]) => any[];
    getDonorByCredentials: (email: string, password: string) => any;
    checkApplicationPermissions: (applicationID: number, permissions: any[]) => boolean;
    checkDonorPermissions: (donorID: number, permissions: any[]) => boolean;
    updateDonorPassword: (donorID: any, password: string) => boolean;
    addAccessKey: (donorID: number, applicationID: number, permissions: any[]) => any;
    addAccessTokenByAccessKey: (accessKey: string) => string;
    deleteAccessKey: (accessKey: string) => boolean;
    deletePasswordResetToken: (token: string) => boolean;
    setup: (dbPool: any) => void;
};
export const meta: {
    getDataOwners: () => import("./DAO_modules/meta").DataOwner[];
    getDefaultOwnerID: () => number;
    setup: (dbPool: any) => void;
};
export const initialpaymentmethod: {
    addPaymentIntent: (KID: number, paymentMethod: string) => Promise<any>;
    setup: (dbPool: any) => void; /**
     * Sets up a connection to the database, uses config.js file for parameters
     * @param {function} cb Callback for when DAO has been sucessfully set up
     */
};
export const facebook: {
    registerPaymentFB: (donorID: any, paymentID: any) => Promise<boolean>;
    setup: (dbPool: any) => void;
};
export function connect(cb: Function): Promise<void>;
