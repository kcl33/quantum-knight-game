describe('卡片交互测试', () => {
  test('点击背面卡片应有变灰效果', async () => {
    const card = document.querySelector('.poker-back-card');
    card.click();
    await new Promise(r => setTimeout(r, 200));
    expect(card.style.filter).toContain('grayscale(100%)');
  });
});