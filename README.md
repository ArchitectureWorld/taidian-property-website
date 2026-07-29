# 武汉泰典物业管理有限公司官网

一个以移动端传播为优先的企业展示官网，核心传递四项信息：

1. 公司法定全称：武汉泰典物业管理有限公司；
2. 对外品牌简称：泰典物业；
3. 公司成立于2014年；
4. 住宅物业与老旧小区服务经验丰富，通过成熟管理提供更高性价比的物业服务。

## 当前技术形态

- 静态 HTML、CSS 与原生 JavaScript；
- 无前端框架和构建依赖；
- 核心图片存放于本地 `assets/` 目录，不依赖外部图床；
- 无需 Node.js、数据库或构建命令；
- 已提供 `vercel.json`，可直接导入 Vercel；
- 支持桌面端和移动端浏览。

## 滚动叙事研发方向

当前动态官网研发统一定义为 **滚动叙事（Scrollytelling）**：以滚动进度作为叙事时间轴，让中文文案、动态视觉、章节编号和背景交接共同推进品牌故事，而不是单纯加入自动动画或按钮切页。

完整要求见：[`docs/SCROLLYTELLING_REQUIREMENTS.md`](docs/SCROLLYTELLING_REQUIREMENTS.md)

当前三个独立实验分支：

- `concept/community-life-network`：社区生命网络滚动叙事；
- `concept/architectural-wireframe`：建筑空间模型滚动叙事；
- `concept/community-digital-overlay`：真实社区数字图层滚动叙事。

三个分支在确认前均不合并到 `main`。

## 本地预览

```bash
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

## 内容替换

上线前请按 `DATA_REQUIREMENTS.md` 准备真实资料。公司法定全称和2014年成立信息已确认；电话、地址、案例、图片及其他业务数据仍为演示内容，不可直接作为正式官网发布。

## 验收测试

```bash
python -m unittest discover -s tests -v
```
