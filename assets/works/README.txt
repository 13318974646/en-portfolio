项目卡片图片已放入：
  work-01-vacuum.jpg      可分离式子母模块化扫地机器人（卡片 01）
  work-02-pineapple.jpg   智能菠萝采收机器人（卡片 02）
  work-03-mini.jpg        「新柿界」小程序界面（卡片 03）

三张图片均为 4:3、1200×900。前两张按网页深色基调做了暗部与对比调整；小程序图保留原图，仅缩放，未调饱和度。

作品 01 详情页技术图：
  vacuum-02-mother.png           母单元外观多视图（块 01）
  vacuum-01-full.png             整机底盘与对接（块 02）
  vacuum-03-sub.png              子单元外观多视图（块 03）
  vacuum-04-cutaway-pair.png     母机 + 子单元合并剖视（块 04）

作品 02 技术图：
  pineapple-01-model.png        整机三维模型四视图
  pineapple-02-lineart.png      整机线稿四视图

作品 03 界面（7 张，已放入手机边框横向滑动）：
  mini-01-growth.png
  mini-02-tasks.png
  mini-03-community.png
  mini-04-profile.png
  mini-05-ai-chat.png
  mini-06-shop.png
  mini-07-achievements.png

其余仍为占位：
- 作品 02：如后续有切割输送细节、应力仿真云图可继续补

替换详情页图片：
1. 在 index.html 搜索对应的 ph__label 或 work-01 / work-02 / work-03；
2. 删掉 figure / div 上的 is-empty；
3. 加入 <img src="./assets/works/xxx.jpg" alt="说明">。

推荐比例：
- 卡片封面 4:3
- 作品 01 大图约 16:10，右侧两张约 2.4:1
- 作品 02 三张图 4:3
- 作品 03 手机截图 9:19.5
