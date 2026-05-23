## 在线wegt扒站 💾
下载任何网站的完整源代码（包括所有资源）🔨。

👉 在线演示: https://bazhan.com.cn/

![enter image description here](https://github.com/AhmadIbrahiim/Website-downloader/blob/master/public/Record.gif?raw=true)
<div align=“center”>

</div>

## 描述 📒
 在线扒站 与 “wget ”和 “archiver ”配合使用，下载所有网站资产并压缩，然后通过套接字通道发送给用户。
 
 **使用的 wget 参数**
 
 `wget --mirror --convert-links --adjust-extension --page-requisites 
--no-parent http://example.org`

 **各种标记的解释:**

 - --mirror – 使下载（除其他外）递归。
- --convert-links – 将所有链接（也包括 CSS 样式表之类的内容）转换为相对链接，以便适合离线查看。
- --adjust-extension – 根据文件名（html 或 css）的内容类型添加适当的扩展名。
- --page-requisites – 下载离线正确显示页面所需的 CSS 样式表和图像等内容。
- --no-parent – 递归时不上升到父目录。它有助于将下载限制在网站的一部分


## 运行方式 🤔

- `git clone https://github.com/hudsonsir/zaixianwget/zaixianwget.git`
- `cd zaixianwget`
- `$ npm install`
- `$ npm start`
- `http://localhost:6868/`



# 感谢❤️❤️
 - 代码是根据Website-downloader（[https://github.com/Ahmadibrahiim/Website-downloader](https://github.com/Ahmadibrahiim/Website-downloader)）    二次开发，
