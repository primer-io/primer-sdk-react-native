import { notEmpty } from "../utils/helpers";
import type { PrimerInputElement } from "./NativeCardNumberInputElementView";
import type { PrimerInputElementType } from "./PrimerInputElementType";
import RNHeadlessCheckoutCardComponentsManager from "./RNHeadlessCheckoutCardComponentsManager";

interface IPrimerHeadlessCheckoutCardComponentsManager {
    registerInputElement: (inputElement: PrimerInputElement) => void;
    registerInputElements: (inputElements: PrimerInputElement[]) => void;
    listRequiredInputElementTypes(): Promise<PrimerInputElementType[]>;
}

let requiredInputElementTypes: PrimerInputElementType[] | null = null;
let requiredInputElementsTags: { [key in PrimerInputElementType]?: PrimerInputElement } = {};

export const PrimerHeadlessCheckoutCardComponentsManager: IPrimerHeadlessCheckoutCardComponentsManager = {

    registerInputElement(inputElement: PrimerInputElement) {
        requiredInputElementsTags[inputElement.type] = inputElement;
        if ((requiredInputElementTypes || []).length >= 3 && Object.keys(requiredInputElementsTags).length === (requiredInputElementTypes || []).length) {
            const reactTags = Object.values(requiredInputElementsTags).map(e => e.reactTag).filter(notEmpty);
            RNHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(reactTags);
        }
    },

    registerInputElements(inputElements: PrimerInputElement[]) {
        const reactTags = inputElements.map(e => e.reactTag).filter(notEmpty);
        if (reactTags.length === inputElements.length) {
            
        }
    },

    async listRequiredInputElementTypes(): Promise<PrimerInputElementType[]> {
        return new Promise(async (resolve, reject) => {
            try {
                requiredInputElementTypes = await RNHeadlessCheckoutCardComponentsManager.listRequiredInputElementTypes();
                resolve(requiredInputElementTypes);
            } catch (err) {
                reject(err);
            }
        })
    },
}