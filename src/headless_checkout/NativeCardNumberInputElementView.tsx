import React from 'react';
import { 
    requireNativeComponent, 
    ViewProps,
    NativeSyntheticEvent
} from 'react-native';

interface NativeCardNumberInputElementViewCallbacks {
    onCardNumberInputElementFocus?: (event: NativeSyntheticEvent<{}>) => void;
}

// export const NativeCardNumberInputElementViewRaw = requireNativeComponent<NativeCardNumberInputElementViewCallbacks>(
//     'NativeCardNumberInputElementView'
// );

const NativeCardNumberInputElementViewRaw = requireNativeComponent('NativeCardNumberInputElementView');

type NativeCardNumberInputElementViewProps = ViewProps & NativeCardNumberInputElementViewCallbacks;

// export const NativeCardNumberInputElementView: React.FC<NativeCardNumberInputElementViewProps> = (
//     props: NativeCardNumberInputElementViewProps
// ) => {
    
//     const _onFocus = (event: NativeSyntheticEvent<{}>) => {
//         debugger;
//     }
    
//     return (
//         <NativeCardNumberInputElementViewRaw 
//             {...props}
//             onCardNumberInputElementFocus={_onFocus}
//         />
//     );
// }







export class NativeCardNumberInputElementView extends React.PureComponent<NativeCardNumberInputElementViewProps, any> {
    _onCardNumberInputElementFocus = (event: any) => {
      if (!this.props.onCardNumberInputElementFocus) {
        debugger;
        return;
      }
      this.props.onCardNumberInputElementFocus(event.nativeEvent)
    }

    render() {
      // Re-assign onEnd to the private _onEnd and store it in `nativeProps`
      const nativeProps = {
        ...this.props,
        onCardNumberInputElementFocus: this._onCardNumberInputElementFocus,
      }
      return (
        <NativeCardNumberInputElementViewRaw
          {...nativeProps}
        />
      )
    }
  }
  
  
  
//   NativeCardNumberInputElementView.propTypes = {
//     /**
//      *  Callback that is called when the current player item ends.
//      */
//      onCardNumberInputElementFocus: PropTypes.func,
//   }