# 泰典物业展示型官网

一个以移动端传播为优先的静态企业展示官网原型，核心传递三项信息：

1. 公司名称：泰典物业；
2. 住宅物业与老旧小区服务经验丰富；
3. 通过成熟管理提供更高性价比的物业服务。

## 当前技术形态

- 单页静态 HTML；
- CSS 和 JavaScript 均内嵌；
- 核心图片存放于本地 `assets/` 目录，不依赖外部图床；
- 无需 Node.js、数据库或构建命令；
- 已提供 `vercel.json`，可直接导入 Vercel；
- 支持桌面端和移动端浏览。

## 本地预览

```bash
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

## 内容替换

上线前请按 `DATA_REQUIREMENTS.md` 准备真实资料。当前页面中的年限、电话、案例、图片和部分数字仍为演示内容，不可直接作为正式官网发布。

## 验收测试

```bash
python -m unittest discover -s tests -v
```
