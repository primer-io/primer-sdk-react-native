export type KlarnaPaymentCategory = IKlarnaPaymentCategory;

/**
 * Interface representing a Klarna payment category.
 */
interface IKlarnaPaymentCategory {
    /**
     * The identifier of the category.
     */
    identifier: string;
    /**
     * The name of the category.
     */
    name: string;
    /**
     * The descriptive asset url of the category.
     */
    descriptiveAssetUrl: string;
      /**
     * The standard asset url of the category.
     */
    standardAssetUrl: string;
}
