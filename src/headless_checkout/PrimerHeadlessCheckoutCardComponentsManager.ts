import { notEmpty } from "../utils/helpers";
import type { PrimerInputElement } from "./NativeCardNumberInputElementView";
import type { PrimerInputElementType } from "./PrimerInputElementType";
import RNHeadlessCheckoutCardComponentsManager from "./RNHeadlessCheckoutCardComponentsManager";

interface IPrimerHeadlessCheckoutCardComponentsManager {
    registerInputElement: (inputElement: PrimerInputElement) => void;
    registerInputElements: (inputElements: PrimerInputElement[]) => void;
    listRequiredInputElementTypes(): Promise<PrimerInputElementType[]>;
    onCardFormIsValidValueChange?: (isValid: boolean) => void;
}

// async function configureListeners(): Promise<void> {
//     return new Promise(async (resolve, reject) => {
//       try {
//         RNHeadlessCheckoutCardComponentsManager.removeAllListeners();

//         let implementedRNCallbacks: any = {
//           onCheckoutComplete: (primerSettings?.onCheckoutComplete !== undefined),
//           onBeforePaymentCreate: (primerSettings?.onBeforePaymentCreate !== undefined),
//           onBeforeClientSessionUpdate: (primerSettings?.onBeforeClientSessionUpdate !== undefined),
//           onClientSessionUpdate: (primerSettings?.onClientSessionUpdate !== undefined),
//           onTokenizeSuccess: (primerSettings?.onTokenizeSuccess !== undefined),
//           onResumeSuccess: (primerSettings?.onResumeSuccess !== undefined),
//           onDismiss: (primerSettings?.onDismiss !== undefined),
//           onError: (primerSettings?.onError !== undefined),
//         };

//         await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);

//         if (implementedRNCallbacks.onCheckoutComplete) {
//           RNPrimer.addListener('onCheckoutComplete', data => {
//             if (primerSettings && primerSettings.onCheckoutComplete) {
//               const checkoutData: PrimerCheckoutData = data;
//               primerSettings.onCheckoutComplete(checkoutData);
//             }
//           });
//         }

//         resolve();
//       } catch (err) {
//         reject(err);
//       }
//     });
//   }

class PrimerHeadlessCheckoutCardComponentsManager implements IPrimerHeadlessCheckoutCardComponentsManager {

    private static instance: PrimerHeadlessCheckoutCardComponentsManager;

    onCardFormIsValidValueChange?: (isValid: boolean) => void;
    requiredInputElementTypes: PrimerInputElementType[] | null = null;
    requiredInputElementsTags: { [key in PrimerInputElementType]?: PrimerInputElement } = {};

    private constructor() {
        RNHeadlessCheckoutCardComponentsManager.addListener('onCardFormIsValidValueChange', data => {
            if (this.onCardFormIsValidValueChange) {
                this.onCardFormIsValidValueChange(data.isCardFormValid || false);
            }
        });
    }

    public static getInstance(): PrimerHeadlessCheckoutCardComponentsManager {
        if (!PrimerHeadlessCheckoutCardComponentsManager.instance) {
            PrimerHeadlessCheckoutCardComponentsManager.instance = new PrimerHeadlessCheckoutCardComponentsManager();
        }

        return PrimerHeadlessCheckoutCardComponentsManager.instance;
    }

    public registerInputElement(inputElement: PrimerInputElement) {
        this.requiredInputElementsTags[inputElement.type] = inputElement;
        if ((this.requiredInputElementTypes || []).length >= 3 && Object.keys(this.requiredInputElementsTags).length === (this.requiredInputElementTypes || []).length) {
            const reactTags = Object.values(this.requiredInputElementsTags).map(e => e.reactTag).filter(notEmpty);
            RNHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(reactTags);

        }
    }

    public registerInputElements(inputElements: PrimerInputElement[]) {
        if ((this.requiredInputElementTypes || []).length >= 3 && Object.keys(inputElements).length === (this.requiredInputElementTypes || []).length) {
            const reactTags = Object.values(inputElements).map(e => e.reactTag).filter(notEmpty);

            RNHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(reactTags);
        }
    }

    public async listRequiredInputElementTypes(): Promise<PrimerInputElementType[]> {
        return new Promise(async (resolve, reject) => {
            try {
                this.requiredInputElementTypes = await RNHeadlessCheckoutCardComponentsManager.listRequiredInputElementTypes();
                resolve(this.requiredInputElementTypes);
            } catch (err) {
                reject(err);
            }
        })
    }

    public tokenize() {
        RNHeadlessCheckoutCardComponentsManager.tokenize();
    }
}

export const primerHeadlessCheckoutCardComponentsManager = PrimerHeadlessCheckoutCardComponentsManager.getInstance();






























// export class PrimerHeadlessCheckoutCardComponentsManager3 implements IPrimerHeadlessCheckoutCardComponentsManager {

//     props: IPrimerHeadlessCheckoutCardComponentsManagerProps

//     constructor(props: IPrimerHeadlessCheckoutCardComponentsManagerProps) {
//         this.props = props;

//         RNHeadlessCheckoutCardComponentsManager.removeAllListeners();
        // RNHeadlessCheckoutCardComponentsManager.addListener('onCardFormIsValidValueChange', data => {
        //     debugger;
        //     props.onCardFormIsValidValueChange(data.isCardFormValid);
        //   });
//     }

//     registerInputElement(inputElement: PrimerInputElement) {
//         requiredInputElementsTags[inputElement.type] = inputElement;
//         if ((requiredInputElementTypes || []).length >= 3 && Object.keys(requiredInputElementsTags).length === (requiredInputElementTypes || []).length) {
//             const reactTags = Object.values(requiredInputElementsTags).map(e => e.reactTag).filter(notEmpty);
//             RNHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(reactTags);
//         }
//     }

//     registerInputElements(inputElements: PrimerInputElement[]) {
//         if ((requiredInputElementTypes || []).length >= 3 && Object.keys(inputElements).length === (requiredInputElementTypes || []).length) {
//             const reactTags = Object.values(inputElements).map(e => e.reactTag).filter(notEmpty);
//             debugger;
//             RNHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(reactTags);
//         }
//     }

//     async listRequiredInputElementTypes(): Promise<PrimerInputElementType[]> {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 requiredInputElementTypes = await RNHeadlessCheckoutCardComponentsManager.listRequiredInputElementTypes();
//                 resolve(requiredInputElementTypes);
//             } catch (err) {
//                 reject(err);
//             }
//         })
//     }
// }

// export const PrimerHeadlessCheckoutCardComponentsManager2: IPrimerHeadlessCheckoutCardComponentsManager = {

//     registerInputElement(inputElement: PrimerInputElement) {
//         requiredInputElementsTags[inputElement.type] = inputElement;
//         if ((requiredInputElementTypes || []).length >= 3 && Object.keys(requiredInputElementsTags).length === (requiredInputElementTypes || []).length) {
//             const reactTags = Object.values(requiredInputElementsTags).map(e => e.reactTag).filter(notEmpty);
//             RNHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(reactTags);
//         }
//     },

//     registerInputElements(inputElements: PrimerInputElement[]) {
//         for (let inputElement of inputElements) {
//             this.registerInputElement(inputElement);
//         }
//     },

//     async listRequiredInputElementTypes(): Promise<PrimerInputElementType[]> {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 requiredInputElementTypes = await RNHeadlessCheckoutCardComponentsManager.listRequiredInputElementTypes();
//                 resolve(requiredInputElementTypes);
//             } catch (err) {
//                 reject(err);
//             }
//         })
//     },
// }

// // export const PrimerHeadlessCheckoutCardComponentsManager = (props: IPrimerHeadlessCheckoutCardComponentsManagerProps) => {

// //     useEffect(() => {
// //         RNHeadlessCheckoutCardComponentsManager.removeAllListeners();
// //         RNHeadlessCheckoutCardComponentsManager.addListener('onCardFormIsValidValueChange', data => {
// //             debugger;
// //             props.onCardFormIsValidValueChange(data.isCardFormValid);
// //           });
// //     }, []);

// //     function registerInputElement(inputElement: PrimerInputElement) {
// //         requiredInputElementsTags[inputElement.type] = inputElement;
// //         if ((requiredInputElementTypes || []).length >= 3 && Object.keys(requiredInputElementsTags).length === (requiredInputElementTypes || []).length) {
// //             const reactTags = Object.values(requiredInputElementsTags).map(e => e.reactTag).filter(notEmpty);
// //             RNHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(reactTags);
// //         }
// //     }

// //     function registerInputElements(inputElements: PrimerInputElement[]) {
// //         for (let inputElement of inputElements) {
// //             registerInputElement(inputElement);
// //         }
// //     }

// //     async function listRequiredInputElementTypes(): Promise<PrimerInputElementType[]> {
// //         return new Promise(async (resolve, reject) => {
// //             try {
// //                 requiredInputElementTypes = await RNHeadlessCheckoutCardComponentsManager.listRequiredInputElementTypes();
// //                 resolve(requiredInputElementTypes);
// //             } catch (err) {
// //                 reject(err);
// //             }
// //         })
// //     }
// // }
