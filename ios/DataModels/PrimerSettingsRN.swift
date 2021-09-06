import PrimerSDK

struct PrimerSettingsRN: Decodable {
    fileprivate let order: OrderRN?
    fileprivate let business: BusinessRN?
    fileprivate let customer: CustomerRN?
    fileprivate let options: OptionsRN?
}

extension PrimerSettingsRN {
    func asPrimerSettings() -> PrimerSettings {
        return PrimerSettings(
            merchantIdentifier: options?.iosMerchantIdentifier,
            customerId: customer?.id,
            amount: order?.amount,
            currency: order?.currency,
            countryCode: order?.countryCode,
            klarnaSessionType: .recurringPayment, // need to update
            urlScheme: options?.iosUrlScheme,
            urlSchemeIdentifier: options?.iosUrlSchemeIdentifier,
            isFullScreenOnly: options?.isFullScreenOnly ?? false,
            hasDisabledSuccessScreen: options?.hasDisabledSuccessScreen ?? false,
            businessDetails: business?.primerFormat,
            orderItems: order?.itemsFormatted ?? [],
            isInitialLoadingHidden: options?.isInitialLoadingHidden ?? false
        )
    }
}

fileprivate struct OrderRN: Decodable {
    let amount: Int?
    let currency: Currency?
    let countryCode: CountryCode?
    let items: [OrderItemRN]?
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
    let address: AddressRN
}

fileprivate extension BusinessRN {
    var primerFormat: BusinessDetails {
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
    let shipping: AddressRN?
    let billing: AddressRN?
}

fileprivate struct AddressRN: Decodable {
    let line1: String?
    let line2: String?
    let postalCode: String?
    let city: String?
    let country: String?
}

fileprivate extension AddressRN {
    var primerFormat: Address {
        return Address(
            addressLine1: line1,
            addressLine2: line2,
            city: city,
            state: nil,
            countryCode: country,
            postalCode: postalCode
        )
    }
}

fileprivate struct OptionsRN: Decodable {
    let hasDisabledSuccessScreen: Bool?
    let isInitialLoadingHidden: Bool?
    let locale: String?
    let iosMerchantIdentifier: String?
    let iosUrlScheme: String?
    let iosUrlSchemeIdentifier: String?
    let isFullScreenOnly: Bool?
}

fileprivate extension String {
    var localeFormatted: Locale {
        return Locale(identifier: self)
    }
}
