module.exports = async function customCommands(browser) {
  browser.addCommand("maximizeDesktopWindow", async () => {
    if (browser.capabilities && browser.capabilities.isDesktop) {
      await browser.maximizeWindow();
    }
  });
};
