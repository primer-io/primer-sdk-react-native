describe("Status success", () => {

    const statusText = () => $(`id=status`);

    it('check status is success', async () => {
        await statusText().waitForDisplayed({ timeout: 30000 });
        console.log(await statusText())
        const result = await statusText().getText();
        expect(result).toBe("Success!");
    });

});