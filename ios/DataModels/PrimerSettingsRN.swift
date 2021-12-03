import PrimerSDK

struct PrimerSettingsRN: Decodable {
    fileprivate let order: OrderRN?
    fileprivate let business: BusinessRN?
    fileprivate let customer: CustomerRN?
    fileprivate let options: OptionsRN?
}

extension PrimerSettingsRN {
    func asPrimerSettings() -> PrimerSettings {
        var address: Address?
        if let billingAddress = customer?.billing {
            address = Address(
                addressLine1: billingAddress.line1,
                addressLine2: billingAddress.line2,
                city: billingAddress.city,
                state: billingAddress.state,
                countryCode: billingAddress.country?.rawValue,
                postalCode: billingAddress.postalCode
            )
        }
    
        return PrimerSettings(
            merchantIdentifier: options?.ios?.merchantIdentifier,
            customerId: customer?.id,
            amount: order?.amount,
            currency: order?.currency,
            countryCode: order?.countryCode,
            klarnaSessionType: .recurringPayment, // need to update
            urlScheme: options?.ios?.urlScheme,
            urlSchemeIdentifier: options?.ios?.urlSchemeIdentifier,
            isFullScreenOnly: options?.isFullScreenEnabled ?? false,
            hasDisabledSuccessScreen: !(options?.isResultScreenEnabled ?? true),
            businessDetails: business?.primerFormat,
            orderItems: order?.itemsFormatted ?? [],
            isInitialLoadingHidden: !(options?.isLoadingScreenEnabled ?? true),
            orderId: order?.id,
            customer: Customer(
                firstName: customer?.firstName,
                lastName: customer?.lastName,
                emailAddress: customer?.email,
                homePhoneNumber: nil,
                mobilePhoneNumber: customer?.phone,
                workPhoneNumber: nil,
                billingAddress: address
            )
        )
    }
}

fileprivate struct OrderRN: Decodable {
    let id: String?
    let amount: Int?
    let currency: Currency?
    // FIXME: Move countryCode only within Address (RN & Android)
    let countryCode: CountryCode?
    let items: [OrderItemRN]?
    let shipping: AddressRN?
}

fileprivate extension OrderRN {
    var itemsFormatted: [OrderItem]? {
        return items?.compactMap { try? $0.primerFormat() }
    }
}

//extension Array where Element == OrderItemRN {
//    var primerFormat: [OrderItem] {
//        return self.map { $0.primerFormat }
//    }
//}

fileprivate struct OrderItemRN: Decodable {
    let name: String
    let unitAmount: Int?
    let quantity: Int
    let isPending: Bool?
}

fileprivate extension OrderItemRN {
    func primerFormat() throws -> OrderItem {
        return try OrderItem(
            name: name,
            unitAmount: unitAmount,
            quantity: quantity,
            isPending: isPending ?? false
        )
    }
}

fileprivate struct BusinessRN: Decodable {
    let name: String
    let registrationNumber: String?
    let email: String?
    let phone: String?
    let address: AddressRN?
}

fileprivate extension BusinessRN {
    var primerFormat: BusinessDetails? {
        guard let address = address else {
            return nil
        }
        
        return BusinessDetails(
            name: name,
            address: address.primerFormat
        )
    }
}

fileprivate struct CustomerRN: Decodable {
    let id: String?
    let firstName: String?
    let lastName: String?
    let email: String?
    let phone: String?
    let billing: AddressRN?
}

fileprivate struct AddressRN: Decodable {
    let line1: String?
    let line2: String?
    let postalCode: String?
    let city: String?
    let state: String?
    let country: CountryCode?
}

fileprivate extension AddressRN {
    var primerFormat: Address {
        return Address(
            addressLine1: line1,
            addressLine2: line2,
            city: city,
            state: state,
            countryCode: country?.rawValue,
            postalCode: postalCode
        )
    }
}

fileprivate struct OptionsRN: Decodable {
    let isResultScreenEnabled: Bool?
    let isLoadingScreenEnabled: Bool?
    let isFullScreenEnabled: Bool?
    let locale: String?
    let ios: IosOptionsRN?
}

fileprivate extension String {
    var localeFormatted: Locale {
        return Locale(identifier: self)
    }
}

fileprivate struct IosOptionsRN: Decodable {
    let urlScheme: String?
    let urlSchemeIdentifier: String?
    let merchantIdentifier: String?
}
