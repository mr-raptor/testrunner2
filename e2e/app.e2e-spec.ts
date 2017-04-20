import { TestrunnerPage } from './app.po';

describe('testrunner App', function() {
  let page: TestrunnerPage;

  beforeEach(() => {
    page = new TestrunnerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
