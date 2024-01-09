describe('Adyan iDeal Headless', () => {
    beforeAll(async () => {
        await device.launchApp(); d
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should select the sandbox enviroment', async () => {
        await element(by.id('Enviroment')).tap({
            nativeEvent: {
                selectedSegmentIndex: 1
            }
        });
    });

    it('should clear the api key', async () => {
        await element(by.id('ApiKey')).clearText();
    });

    it('should change the country code', async () => {
        await element(by.id('CountryCode')).replaceText("NL");
    });

    it('should tap on headless universal checkout and expect some text to be visible', async () => {
        await element(by.id('HeadlessUniversalCheckout')).tap();
        await expect(element(by.text('HUC'))).toBeVisible();
    });

    it('should find the iDeal button', async () => {
        await expect(element(by.text('button-adyen-ideal'))).toBeVisible();
    });

    it('should tap on iDeal button and expect some text to be visible', async () => {
        await element(by.id('button-adyen-ideal')).tap();
        await expect(element(by.text('test-issuer'))).toBeVisible();
    });

    it('should tap on Continue button and expect some text to be visible', async () => {
        await element(by.text('Continue')).tap();
        await expect(element(by.text('Result'))).toBeVisible();
    });
});