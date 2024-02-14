import React from 'react';
import { useCallback } from 'react';
import { UIManager, ViewProps, findNodeHandle } from 'react-native';
import { PrimerKlarnaPaymentViewRaw } from './PrimerKlarnaPaymentViewRaw';

const createFragment = (viewId: any) => {
    UIManager.dispatchViewManagerCommand(
        viewId,
        UIManager.PrimerKlarnaPaymentView.Commands.create.toString(),
        [viewId], 
    );
}

type PrimerKlarnaPaymentViewProps = ViewProps;

export const PrimerKlarnaPaymentView: React.FC<PrimerKlarnaPaymentViewProps> = (props) => {
    const createFragmentCallback = useCallback((node: any) => {
        const viewId = findNodeHandle(node);
        console.log("View ID: " + viewId)
        if (viewId !== null) {
            createFragment(viewId);
        }
    }, []);

    return <PrimerKlarnaPaymentViewRaw ref={createFragmentCallback} {...props} />;
};