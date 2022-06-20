import React from 'react';
import { 
    requireNativeComponent, 
    ViewProps,
    NativeSyntheticEvent
} from 'react-native';

interface NativeCardNumberInputElementViewCallbacks {
    onFocus?: (event: NativeSyntheticEvent<{}>) => void;
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
    _onFocus = (event: any) => {
      if (!this.props.onFocus) {
        debugger;
        return;
      }
      this.props.onFocus(event.nativeEvent)
    }

    render() {
      // Re-assign onEnd to the private _onEnd and store it in `nativeProps`
      const nativeProps = {
        ...this.props,
        onFocus: this._onFocus,
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