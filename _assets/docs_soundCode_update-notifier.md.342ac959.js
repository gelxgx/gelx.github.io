import{q as t,g as e,l as n,K as a,j as i}from"./common-1984dd55.js";const o='{"title":"【源码第五期】分析update-notifier","frontmatter":{"date":"2021-11-10","title":"【源码第五期】分析update-notifier","tags":["源码"],"describe":"浅析 update-notifier如何检测npm更新"},"headers":[{"level":3,"title":"1.阅读前准备","slug":"_1-阅读前准备"},{"level":3,"title":"2.源码地址","slug":"_2-源码地址"},{"level":3,"title":"3.开始阅读","slug":"_3-开始阅读"},{"level":3,"title":"","slug":""},{"level":3,"title":"4.总结","slug":"_4-总结"}],"relativePath":"docs/soundCode/update-notifier.md","lastUpdated":1646063815125.8818}';var s={};const r=a('<h3 id="_1-阅读前准备"><a class="header-anchor" href="#_1-阅读前准备" aria-hidden="true">#</a> 1.阅读前准备</h3><p>曾经<code>npm install</code>之后会发现会自动弹出npm依赖包升级的页面<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb24bef414364c2fbd3943aa7fb25e87~tplv-k3u1fbpfcp-zoom-1.image" alt=""></p><p>现在就来研究下到底是怎么做到的</p><h3 id="_2-源码地址"><a class="header-anchor" href="#_2-源码地址" aria-hidden="true">#</a> 2.源码地址</h3><p><a href="https://github.com/yeoman/update-notifier" target="_blank" rel="noopener noreferrer">https://github.com/yeoman/update-notifier</a></p><h3 id="_3-开始阅读"><a class="header-anchor" href="#_3-开始阅读" aria-hidden="true">#</a> 3.开始阅读</h3><p><code>UpdateNotifier</code>构造函数中，分为三部分函数：check()检查函数；fetchInfo获取信息函数；notify通知函数</p><p>整个代码中引用了很多第三方库</p><p>先从<code>UpdateNotifier</code>构造函数入手</p><h4 id="_3-1-构造函数"><a class="header-anchor" href="#_3-1-构造函数" aria-hidden="true">#</a> 3.1 构造函数</h4><div class="language-"><pre><code>constructor(options = {}) {\n  \t// 主要是对传入的options对象中的参数进行校验\n\t\tthis.options = options;\n\t\toptions.pkg = options.pkg || {};\n\t\toptions.distTag = options.distTag || &#39;latest&#39;;\n\n\t\t// Reduce pkg to the essential keys. with fallback to deprecated options\n\t\t// TODO: Remove deprecated options at some point far into the future\n\t\toptions.pkg = {\n\t\t\tname: options.pkg.name || options.packageName,\n\t\t\tversion: options.pkg.version || options.packageVersion\n\t\t};\n\t\t// 如果缺少必要 则抛出异常\n\t\tif (!options.pkg.name || !options.pkg.version) {\n\t\t\tthrow new Error(&#39;pkg.name and pkg.version required&#39;);\n\t\t}\n\n\t\tthis.packageName = options.pkg.name;\n\t\tthis.packageVersion = options.pkg.version;\n  \t// 检查传入的时间戳，如果不是时间则采用默认时间戳\n\t\tthis.updateCheckInterval = typeof options.updateCheckInterval === &#39;number&#39; ? options.updateCheckInterval : ONE_DAY;\n\t\tthis.disabled = &#39;NO_UPDATE_NOTIFIER&#39; in process.env ||\n\t\t\tprocess.env.NODE_ENV === &#39;test&#39; ||\n\t\t\tprocess.argv.includes(&#39;--no-update-notifier&#39;) ||\n\t\t\tisCi();\n\t\tthis.shouldNotifyInNpmScript = options.shouldNotifyInNpmScript;\n\n\t\tif (!this.disabled) {\n\t\t\ttry {\n\t\t\t\tconst ConfigStore = configstore();\n\t\t\t\tthis.config = new ConfigStore(`update-notifier-${this.packageName}`, {\n\t\t\t\t\toptOut: false,\n\t\t\t\t\t// Init with the current time so the first check is only\n\t\t\t\t\t// after the set interval, so not to bother users right away\n\t\t\t\t\tlastUpdateCheck: Date.now()\n\t\t\t\t});\n\t\t\t} catch {\n\t\t\t\t// Expecting error code EACCES or EPERM\n\t\t\t\tconst message =\n\t\t\t\t\tchalk().yellow(format(&#39; %s update check failed &#39;, options.pkg.name)) +\n\t\t\t\t\tformat(&#39;\\n Try running with %s or get access &#39;, chalk().cyan(&#39;sudo&#39;)) +\n\t\t\t\t\t&#39;\\n to the local update config store via \\n&#39; +\n\t\t\t\t\tchalk().cyan(format(&#39; sudo chown -R $USER:$(id -gn $USER) %s &#39;, xdgBasedir().config));\n\n\t\t\t\tprocess.on(&#39;exit&#39;, () =&gt; {\n\t\t\t\t\tconsole.error(boxen()(message, {align: &#39;center&#39;}));\n\t\t\t\t});\n\t\t\t}\n\t\t}\n\t}\n</code></pre></div><h4 id="_3-2-check检查函数"><a class="header-anchor" href="#_3-2-check检查函数" aria-hidden="true">#</a> 3.2 check检查函数</h4><div class="language-"><pre><code>check() {\n  \t// 如果出现以下几种情况时，则直接退出\n\t\tif (\n\t\t\t!this.config ||\n\t\t\tthis.config.get(&#39;optOut&#39;) ||\n\t\t\tthis.disabled\n\t\t) {\n\t\t\treturn;\n\t\t}\n\t\t// 获取包更新信息（第一次获取的时候为undefined）\n\t\tthis.update = this.config.get(&#39;update&#39;);\n\t\t\n\t\tif (this.update) {\n\t\t\t// 如果存在，则赋值最新版本\n\t\t\tthis.update.current = this.packageVersion;\n\n\t\t\t// 并清理缓存\n\t\t\tthis.config.delete(&#39;update&#39;);\n\t\t}\n\n\t\t// 如果最后一次获取更新的时间小于用户设置的检查时间 则直接退出\n\t\tif (Date.now() - this.config.get(&#39;lastUpdateCheck&#39;) &lt; this.updateCheckInterval) {\n\t\t\treturn;\n\t\t}\n\n\t\t// 调用子进程执行check文件\n  \t// 这里的unref 方法用于断绝与父进程的关系，父进程退出不会造成子进程的退出\n\t\tspawn(process.execPath, [path.join(__dirname, &#39;check.js&#39;), JSON.stringify(this.options)], {\n\t\t\tdetached: true,\n\t\t\tstdio: &#39;ignore&#39;\n\t\t}).unref();\n\t}\n</code></pre></div><p>在进行check函数的执行后，会进入check.js文件的执行，进一步看check.js中又发生了什么</p><div class="language-"><pre><code>let updateNotifier = require(&#39;.&#39;);\n\nconst options = JSON.parse(process.argv[2]);\n\nupdateNotifier = new updateNotifier.UpdateNotifier(options);\n\n(async () =&gt; {\n\tsetTimeout(process.exit, 1000 * 30);\n\t// 在这里继续调用updateNotifier中的获取数据的方法\n\tconst update = await updateNotifier.fetchInfo();\n\n\t// 并更新最后更新检查时间的时间字段\n\tupdateNotifier.config.set(&#39;lastUpdateCheck&#39;, Date.now());\n\t// 如果此时时间不是最新，则会更新为最新\n\tif (update.type &amp;&amp; update.type !== &#39;latest&#39;) {\n\t\tupdateNotifier.config.set(&#39;update&#39;, update);\n\t}\n\n\t// Call process exit explicitly to terminate the child process,\n\t// otherwise the child process will run forever, according to the Node.js docs\n\tprocess.exit();\n})().catch(error =&gt; {\n\tconsole.error(error);\n\tprocess.exit(1);\n});\n</code></pre></div><p>check.js这里主要为开启子进程，获取最新版本信息的步骤，执行完成后将退出子进程</p><h4 id="_3-3-fetchinfo-获取信息函数"><a class="header-anchor" href="#_3-3-fetchinfo-获取信息函数" aria-hidden="true">#</a> 3.3 fetchInfo()获取信息函数</h4><div class="language-"><pre><code>async fetchInfo() {\n  const {distTag} = this.options;\n  // 这里主要通过懒加载的方式执行获取包信息的步骤\n  const latest = await latestVersion()(this.packageName, {version: distTag});\n\n  return {\n    latest,\n    current: this.packageVersion,\n    // 这里会做信息的diff\n    type: semverDiff()(this.packageVersion, latest) || distTag,\n    name: this.packageName\n  };\n}\n</code></pre></div><h4 id="_3-4-notify-通知函数"><a class="header-anchor" href="#_3-4-notify-通知函数" aria-hidden="true">#</a> 3.4 notify()通知函数</h4><div class="language-"><pre><code>\tnotify(options) {\n\t\tconst suppressForNpm = !this.shouldNotifyInNpmScript &amp;&amp; isNpm().isNpmOrYarn;\n\t\tif (!process.stdout.isTTY || suppressForNpm || !this.update || !semver().gt(this.update.latest, this.update.current)) {\n\t\t\treturn this;\n\t\t}\n\n\t\toptions = {\n      // 是否为全局安装\n\t\t\tisGlobal: isInstalledGlobally(),\n      // 是否为yarn全局安装\n\t\t\tisYarnGlobal: isYarnGlobal()(),\n\t\t\t...options\n\t\t};\n\n\t\tlet installCommand;\n    // 根据yarn和npm的判断 展示不同的命令指示符给用户\n\t\tif (options.isYarnGlobal) {\n\t\t\tinstallCommand = `yarn global add ${this.packageName}`;\n\t\t} else if (options.isGlobal) {\n\t\t\tinstallCommand = `npm i -g ${this.packageName}`;\n\t\t} else if (hasYarn()()) {\n\t\t\tinstallCommand = `yarn add ${this.packageName}`;\n\t\t} else {\n\t\t\tinstallCommand = `npm i ${this.packageName}`;\n\t\t}\n\n\t\tconst defaultTemplate = &#39;Update available &#39; +\n\t\t\tchalk().dim(&#39;{currentVersion}&#39;) +\n\t\t\tchalk().reset(&#39; → &#39;) +\n\t\t\tchalk().green(&#39;{latestVersion}&#39;) +\n\t\t\t&#39; \\nRun &#39; + chalk().cyan(&#39;{updateCommand}&#39;) + &#39; to update&#39;;\n\t\t\n\t\tconst template = options.message || defaultTemplate;\n\n\t\toptions.boxenOptions = options.boxenOptions || {\n\t\t\tpadding: 1,\n\t\t\tmargin: 1,\n\t\t\talign: &#39;center&#39;,\n\t\t\tborderColor: &#39;yellow&#39;,\n\t\t\tborderStyle: &#39;round&#39;\n\t\t};\n\n\t\tconst message = boxen()(\n\t\t\tpupa()(template, {\n\t\t\t\tpackageName: this.packageName,\n\t\t\t\tcurrentVersion: this.update.current,\n\t\t\t\tlatestVersion: this.update.latest,\n\t\t\t\tupdateCommand: installCommand\n\t\t\t}),\n\t\t\toptions.boxenOptions\n\t\t);\n\n\t\tif (options.defer === false) {\n\t\t\tconsole.error(message);\n\t\t} else {\n\t\t\tprocess.on(&#39;exit&#39;, () =&gt; {\n\t\t\t\tconsole.error(message);\n\t\t\t});\n\n\t\t\tprocess.on(&#39;SIGINT&#39;, () =&gt; {\n\t\t\t\tconsole.error(&#39;&#39;);\n\t\t\t\tprocess.exit();\n\t\t\t});\n\t\t}\n\n\t\treturn this;\n\t}\n</code></pre></div><h3 id=""><a class="header-anchor" href="#" aria-hidden="true">#</a></h3><h3 id="_4-总结"><a class="header-anchor" href="#_4-总结" aria-hidden="true">#</a> 4.总结</h3><p>整个过程比较简单，主体就为updateNotifier构造函数，其中执行的步骤为：</p><ul><li>new了一个updateNotifier对象</li><li>执行check()函数</li></ul>',24),p=i("ul",null,[i("li",null,[i("ul",null,[i("li",null,"判断是否需要执行check.js")])])],-1),c=i("ul",null,[i("li",null,"执行fetchInfo()函数获取信息"),i("li",null,"set('lastUpdateCheck')设置最后获取更新的时间")],-1),l=i("ul",null,[i("li",null,"set('update')设置一个需要更新的列表"),i("li",null,"notify()函数，展示给用户目前可更新的依赖包，并根据包类型展示命令符")],-1);s.render=function(a,i,o,s,d,h){return t(),e("div",null,[r,n(""),p,n(""),c,n(""),l])};export{o as __pageData,s as default};
