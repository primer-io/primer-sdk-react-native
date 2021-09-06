import PrimerSDK

struct PrimerThemeRN: Decodable {
    let colors: ColorThemeRN?;
    let darkModeColors: ColorThemeRN?;
}

extension PrimerThemeRN {
    func asPrimerTheme() -> PrimerTheme {
        if #available(iOS 13.0, *) {
            return PrimerTheme(
                colorTheme: colors?.primerColorTheme ?? PrimerDefaultTheme(),
                darkTheme: darkModeColors?.primerDarkModeTheme ?? PrimerDarkTheme()
            )
        } else {
            return PrimerTheme(
                colorTheme: colors?.primerColorTheme ?? PrimerDefaultTheme()
            )
        }
    }
}

struct ColorThemeRN: Decodable {
    let mainColor: ColorRN?
    let contrastingColor: ColorRN?
    let background: ColorRN?
    let text: ColorRN?
    let contrastingText: ColorRN?
    let borders: ColorRN?
    let disabled: ColorRN?
    let error: ColorRN?
}

extension ColorThemeRN {
    var primerColorTheme: ColorTheme {
        return PrimerDefaultTheme(
            text1: text?.uiColor ?? .black,
            text2: contrastingText?.uiColor ?? .white,
            text3: mainColor?.uiColor ?? .systemBlue,
            secondaryText1: disabled?.uiColor ?? .lightGray,
            main1: background?.uiColor ?? .white,
            main2: disabled?.uiColor ?? .lightGray,
            tint1: mainColor?.uiColor ?? .systemBlue,
            neutral1: disabled?.uiColor ?? .lightGray,
            disabled1: disabled?.uiColor ?? .lightGray,
            error1: error?.uiColor ?? .systemRed,
            success1: mainColor?.uiColor ?? .systemBlue
        )
    }
    
    @available(iOS 13.0, *)
    var primerDarkModeTheme: ColorTheme  {
        return PrimerDefaultTheme(
            text1: text?.uiColor ?? .white,
            text2: contrastingText?.uiColor ?? .white,
            text3: mainColor?.uiColor ?? .systemBlue,
            secondaryText1: disabled?.uiColor ?? .systemGray,
            main1: background?.uiColor ?? .systemGray6,
            main2: disabled?.uiColor ?? .systemGray5,
            tint1: mainColor?.uiColor ?? .systemBlue,
            neutral1: disabled?.uiColor ?? .systemGray3,
            disabled1: disabled?.uiColor ?? .systemGray3,
            error1: mainColor?.uiColor ?? .systemRed,
            success1: mainColor?.uiColor ?? .systemBlue
        )
    }
}

struct ColorRN: Decodable {
    let red: CGFloat
    let green: CGFloat
    let blue: CGFloat
    let alpha: CGFloat
}

extension ColorRN {
    var uiColor: UIColor {
        return UIColor.init(red: red/255, green: green/255, blue: blue/255, alpha: alpha/255)
    }
}
