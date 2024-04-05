//
//  PrimerKlarnaPaymentView.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 05.04.2024.
//

import UIKit

@objc(PrimerKlarnaPaymentView)
class PrimerKlarnaPaymentView: UIView {
    
    @objc
    override init(frame: CGRect) {
        super.init(frame: frame)
    }
    
    @objc
    func updateWith(view: UIView) {
        view.translatesAutoresizingMaskIntoConstraints = false
        addSubview(view)
        
        NSLayoutConstraint.activate([
            view.centerXAnchor.constraint(equalTo: centerXAnchor),
            view.centerYAnchor.constraint(equalTo: centerYAnchor),
            view.heightAnchor.constraint(equalToConstant: view.frame.height),
            view.widthAnchor.constraint(equalToConstant: view.frame.width)
        ])
    }
    
    @objc
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
