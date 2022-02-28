import{q as e,g as t,K as n}from"./common-1984dd55.js";const a='{"title":"【源码计划第九期】浅析vite","frontmatter":{"date":"2022-02-21","title":"【源码计划第九期】浅析vite","tags":["源码"],"describe":"学习原生ESModule"},"headers":[{"level":3,"title":"一、什么是原生ESModule？","slug":"一、什么是原生esmodule？"},{"level":3,"title":"二、这个工具做了什么事情？","slug":"二、这个工具做了什么事情？"},{"level":3,"title":"三、实现过程","slug":"三、实现过程"},{"level":3,"title":"四、总结","slug":"四、总结"}],"relativePath":"docs/soundCode/vite.md","lastUpdated":1646063815125.8818}';var r={};const s=[n('<blockquote><p>对vite的第一印象：快，非常快</p></blockquote><p>本着对vite的兴趣，在阅读完<a href="https://github.com/vuejs/vue-dev-server" target="_blank" rel="noopener noreferrer">玩具vite</a>源码后，对vite的原理有了一个简单的理解：</p><ul><li><p>使用浏览器原生ESModule加载项目文件</p></li><li><p>把需要加载的文件，转译成浏览器看得懂的js文件</p></li><li><p>使用缓存机制，提升HMR速度</p></li></ul><h3 id="一、什么是原生esmodule？"><a class="header-anchor" href="#一、什么是原生esmodule？" aria-hidden="true">#</a> 一、什么是原生ESModule？</h3><h4 id="_1-解释"><a class="header-anchor" href="#_1-解释" aria-hidden="true">#</a> 1.解释</h4><p>这是一个可以让HTML加载script标签时，使用ESModule的方式直接进行加载，例如：</p><div class="language-"><pre><code>&lt;script type=&quot;module&quot;&gt;\n\timport main from &#39;./main.js&#39;\n&lt;/script&gt;\n</code></pre></div><h4 id="_2-为什么会快？"><a class="header-anchor" href="#_2-为什么会快？" aria-hidden="true">#</a> 2.为什么会快？</h4><p>浏览器在加载页面遇到原生ES模块时，会通过发送请求的方式导入模块。页面引入模块但未被加载时，这些模块将不会被导入</p><h3 id="二、这个工具做了什么事情？"><a class="header-anchor" href="#二、这个工具做了什么事情？" aria-hidden="true">#</a> 二、这个工具做了什么事情？</h3><h4 id="_1-开发背景"><a class="header-anchor" href="#_1-开发背景" aria-hidden="true">#</a> 1.开发背景</h4><p>在编写vue项目时，我们会需要经历以下步骤：</p><ul><li>引入vue，将vue挂载在html的一个节点中</li></ul><div class="language-"><pre><code>import Vue from &#39;vue&#39;\nimport App from &#39;./test.vue&#39;\n\nnew Vue({\n  render: h =&gt; h(App)\n}).$mount(&#39;#app&#39;)\n</code></pre></div><p>对于原生ESModule来说，import文件时，需要提供文件完整的URL路径，不能进行简写。</p><ul><li>编写vue文件</li></ul><div class="language-"><pre><code>&lt;template&gt;\n  ...\n&lt;/template&gt;\n\n&lt;script&gt;\nexport default {\n  ...\n}\n&lt;/script&gt;\n\n&lt;style scoped&gt;\n...\n&lt;/style&gt;\n</code></pre></div><p>对于浏览器来说，不支持解析vue文件，这样也就导致无法加载页面</p><h4 id="工具需要解决的事情"><a class="header-anchor" href="#工具需要解决的事情" aria-hidden="true">#</a> 工具需要解决的事情</h4><ul><li>在不改变编写习惯的前提下，改变文件加载路径</li><li>对vue文件进行转译</li></ul><h3 id="三、实现过程"><a class="header-anchor" href="#三、实现过程" aria-hidden="true">#</a> 三、实现过程</h3><p>在这个小工具中通过使用加载中间件拦截请求的方式进行文件的实时编译，这一文件存放在<code>../bin/vue-dev-server.js</code>中</p><div class="language-"><pre><code>const express = require(&#39;express&#39;)\nconst { vueMiddleware } = require(&#39;../middleware&#39;)\n\nconst app = express()\nconst root = process.cwd();\n\n// 最重要的一步\napp.use(vueMiddleware())\n\napp.use(express.static(root))\n\napp.listen(3000, () =&gt; {\n  console.log(&#39;server running at http://localhost:3000&#39;)\n})\n</code></pre></div><p>最重要的中间件文件被放在了<code>../middleware</code>中</p><h4 id="_1-解析主逻辑"><a class="header-anchor" href="#_1-解析主逻辑" aria-hidden="true">#</a> 1.解析主逻辑</h4><p>在这个中间件中，分别对<code>.vue</code>、<code>.js</code>、包含<code>__modules</code>三种类型的文件进行了不同的处理</p><div class="language-"><pre><code>return async (req, res, next) =&gt; {\n    if (req.path.endsWith(&#39;.vue&#39;)) {      \n      // ...code 处理vue文件\n      }\n      \n      send(res, out.code, &#39;application/javascript&#39;)\n    } else if (req.path.endsWith(&#39;.js&#39;)) {\n       // ...code 处理js文件\n      }\n\n      send(res, out, &#39;application/javascript&#39;)\n    } else if (req.path.startsWith(&#39;/__modules/&#39;)) {\n      // ...code 处理第三方包\n      }\n\n      send(res, out, &#39;application/javascript&#39;)\n    } else {\n      next()\n    }\n  }\n</code></pre></div><h4 id="_1-1解析vue文件"><a class="header-anchor" href="#_1-1解析vue文件" aria-hidden="true">#</a> 1.1解析vue文件</h4><p>对于浏览器请求到vue的文件时，会被中间件拦截下来，执行<code>bundlesSFC()</code>逻辑。</p><p>这部分主要是将.vue中的<code>template</code>、<code>script</code>、<code>css</code>实时编译成浏览器可以被正常加载的代码。这部分主要涉及到vue组件编译的代码，会在后续进行深入研究。</p><div class="language-"><pre><code>if (req.path.endsWith(&#39;.vue&#39;)) {      \n  const key = parseUrl(req).pathname\n  let out = await tryCache(key)\n\n  if (!out) {\n    // Bundle Single-File Component\n    const result = await bundleSFC(req)\n    out = result\n    cacheData(key, out, result.updateTime)\n  }\n\n  send(res, out.code, &#39;application/javascript&#39;)\n} \n\nasync function bundleSFC (req) {\n  const { filepath, source, updateTime } = await readSource(req)\n  const descriptorResult = compiler.compileToDescriptor(filepath, source)\n  const assembledResult = vueCompiler.assemble(compiler, filepath, {\n    ...descriptorResult,\n    script: injectSourceMapToScript(descriptorResult.script),\n    styles: injectSourceMapsToStyles(descriptorResult.styles)\n  })\n  return { ...assembledResult, updateTime }\n}\n</code></pre></div><h4 id="_1-2-解析js文件"><a class="header-anchor" href="#_1-2-解析js文件" aria-hidden="true">#</a> 1.2 解析js文件</h4><p>这部分主要是获取js文件地址，并通过<code>transformModuleImports()</code>方法，将js中文件的引入方式全部转化为ESModule的引入方式。</p><div class="language-"><pre><code>else if (req.path.endsWith(&#39;.js&#39;)) {\n  const key = parseUrl(req).pathname\n  let out = await tryCache(key)\n\n  if (!out) {\n    // transform import statements\n    const result = await readSource(req)\n    out = transformModuleImports(result.source)\n    cacheData(key, out, result.updateTime)\n  }\n\n  send(res, out, &#39;application/javascript&#39;)\n}\n\n\n// 这里用了第三方库recast，是一个将文件编译成AST树的插件\n\nfunction transformModuleImports(code) {\n  const ast = recast.parse(code)\n  recast.types.visit(ast, {\n    visitImportDeclaration(path) {\n      const source = path.node.source.value\n      // 同时会对js中出现引入方式为非完整URL路径、且是npm包的代码进行转义成&#39;__modules/xxx&#39;\n      if (!/^./?/.test(source) &amp;&amp; isPkg(source)) {\n        path.node.source = recast.types.builders.literal(`/__modules/${source}`)\n      }\n      this.traverse(path)\n    }\n  })\n  return recast.print(ast).code\n}\n</code></pre></div><h4 id="_1-3-解析转义后的-modules"><a class="header-anchor" href="#_1-3-解析转义后的-modules" aria-hidden="true">#</a> 1.3 解析转义后的__modules</h4><p>在处理完需要转义的js包路径后，会对这部分的文件进行加载，主要是通过封装好的<code>loadPkg()</code>进行操作</p><div class="language-"><pre><code>else if (req.path.startsWith(&#39;/__modules/&#39;)) {\n  const key = parseUrl(req).pathname\n  const pkg = req.path.replace(/^/__modules//, &#39;&#39;)\n\n  let out = await tryCache(key, false) // Do not outdate modules\n  if (!out) {\n    out = (await loadPkg(pkg)).toString()\n    cacheData(key, out, false) // Do not outdate modules\n  }\n\n  send(res, out, &#39;application/javascript&#39;)\n}\n\n// 这部分逻辑中，尤大只支持加载vue\nasync function loadPkg(pkg) {\n  if (pkg === &#39;vue&#39;) {\n    const dir = path.dirname(require.resolve(&#39;vue&#39;))\n    const filepath = path.join(dir, &#39;vue.esm.browser.js&#39;)\n    return readFile(filepath)\n  }\n  else {\n    // TODO\n    // check if the package has a browser es module that can be used\n    // otherwise bundle it with rollup on the fly?\n    throw new Error(&#39;npm imports support are not ready yet.&#39;)\n  }\n}\n</code></pre></div><p>通过这部分的转义，最初的<code>import Vue from &#39;vue&#39;</code>最后通过转义，加载的文件变成了vue中的<code>vue.esm.browser.js</code>文件，达到加载vue的目的</p><h4 id="_2-实时编译中变得更快"><a class="header-anchor" href="#_2-实时编译中变得更快" aria-hidden="true">#</a> 2.实时编译中变得更快</h4><p>这部分通过使用LRU缓存库，通过对加载后的文件进行缓存，在加载文件时进行文件对比，从而决定是否更新文件</p><div class="language-"><pre><code>// 初始化LRU缓存\nconst LRU = require(&#39;lru-cache&#39;)\n\tcache = new LRU({\n  max: 500,\n  length: function (n, key) { return n * 2 + key.length }\n})\n\n// 判断文件是否需要缓存\nasync function tryCache (key, checkUpdateTime = true) {\n  // 首先检查缓存中是否有该文件\n  const data = cache.get(key)\n\n  if (checkUpdateTime) {\n    // 是否有该缓存时间\n    const cacheUpdateTime = time[key]\n    // 创建一个文件更新时间并进行对比\n    const fileUpdateTime = (await stat(path.resolve(root, key.replace(/^//, &#39;&#39;)))).mtime.getTime()\n    if (cacheUpdateTime &lt; fileUpdateTime) return null\n  }\n\n  return data\n}\n\n// 在对文件进行处理完后，都会将文件加入缓存中\nfunction cacheData (key, data, updateTime) {\n  \t// 调用包中的方法，判断文件是否有变化\n    const old = cache.peek(key)\n    if (old != data) \n      cache.set(key, data)\n      if (updateTime) time[key] = updateTime\n      return true\n    } else return false\n  }\n</code></pre></div><h3 id="四、总结"><a class="header-anchor" href="#四、总结" aria-hidden="true">#</a> 四、总结</h3><p>通过对这个源码的阅读，首先对vite的“急速”体验，有了基础的理解。当然vite的代码会比当前包更复杂，处理更多的情况。</p><p>在阅读完后，后续还会对vue和vite进行更深入的了解，包括：</p><ul><li><p>LRU缓存</p></li><li><p>SFC编译解析</p></li><li><p>JS文件解析成AST树</p></li></ul>',45)];r.render=function(n,a,r,o,i,d){return e(),t("div",null,s)};export{a as __pageData,r as default};
