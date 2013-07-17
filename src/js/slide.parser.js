/**
 * File     : slide.parser.js
 * Encoding : UTF-8 without BOM
 * Title    : Slide Show Parser Script
 * Desc.    : スライドショーのテキストパーサースクリプトです。
 *          : Markdown記法とPukiWiki記法を参考に独自記法による
 *          : スライドファイルのパースおよびHTML化を行います。
 *          : cf) Markdown記法(原文) - http://daringfireball.net/projects/markdown/syntax.php
 *          :
 * Version  : 0.1.0
 * Author   : Rezelk
 * Changes  : 2013/06/25 0.1.0 Rezelk Created
 */

// スクリプト固有の名前空間を作成
slide.parser = {};

//============================================================================//
// スクリプト情報＆動作設定 - begin
slide.parser.script = {
	// スクリプト情報
	thisFile     : "slide.parser.js",
	name         : "Slide Show Parser",
	version      : "0.1.0",
	lastModified : "2013/06/25"
	
	// スクリプト動作設定
	// なし
};
// スクリプト情報＆動作設定 - end
//============================================================================//

console.info("'" + slide.parser.script.thisFile + "' is loaded.");

//============================================================================//
// テキストパース処理
slide.parser.parse = function(text) {
	
	console.info("Parsing text.");
	console.groupCollapsed("Parsing text - details");
	
	var $root = $("<article>").id("root");
	var $currentPage = $("#slide");
	var $currentBlock = null;
	var $currentList = null;
	var $currentQuote = null;
	var $currentTable = null;
	var $currentCode = null;
	
	// 改行コードで分割
	var lines = text.split("\n");
	// 行数
	var maxLine = lines.length;
	// 空白行カウント
	var returnCount = 0;
	// リスト要素を追加するタイミングでtrue
	var allowAppendList = false;
	// 引用ブロック要素を追加するタイミングでtrue
	var allowAppendQuote = false;
	// テーブル要素を追加するタイミングでtrue
	var allowAppendTable = false;
	// コード領域を追加するタイミングでtrue
	var allowAppendCode = false;
	// 各行を解析
	for(var index in lines) {
		
		console.debug(index + ":" + lines[index]);
		
		// リスト追加許可がtrueならリストを追加
		if (allowAppendList === true) {
			$currentPage.append( $currentList );
			// 追加したら初期化
			$currentList = null;
			allowAppendList = false;
		}
		
		// 引用ブロック追加許可がtrueなら引用ブロックを追加
		if (allowAppendQuote === true) {
			$currentPage.append( $currentQuote );
			// 追加したら初期化
			$currentQuote = null;
			allowAppendQuote = false;
		}
		
		// テーブル追加許可がtrueなら引用ブロックを追加
		if (allowAppendTable === true) {
			$currentPage.append( $currentTable );
			// 追加したら初期化
			$currentTable = null;
			allowAppendTable = false;
		}
		
		// コード領域追加許可がtrueなら引用ブロックを追加
		if (allowAppendCode === true) {
			$currentPage.append( $currentCode );
			// 追加したら初期化
			$currentCode = null;
			allowAppendCode = false;
		}
		
		// 行データ取得
		var line = lines[index];
		
		// インラインテキスト
		var inlineText = null;
		// match文字列配列
		var matches = null;
		
		// 連続ブロック要素解析 - begin ---------------------------------------
		// 単純リスト
		matches = line.match(/^- (.+)/);
		if (matches !== null && matches.length === 2) {
			// 新しいリストを作成/追加
			if ($currentList === null) {
				// 初見の場合はリスト要素を作成
				console.debug(" -> ul");
				$currentList = $("<ul>");
			}
			// リスト項目を作成
			console.debug(" -> ul>li");
			$currentBlock = $("<li>");
			// リストにリスト要素を追加
			$currentList.append($currentBlock);
			inlineText = matches[1];
			isList = true;
			
		} else if ($currentList !== null && $currentList[0].tagName === "UL") {
			// ULリストを保持していて、現在の要素がリスト以外場合はリスト書出＆初期化
			allowAppendList = true;
		}
		
		// 数字リスト
		matches = line.match(/^\d+\. (.+)/);
		if (matches !== null && matches.length === 2) {
			// 新しいリストを作成/追加
			if ($currentList === null) {
				// 初見の場合はリスト要素を作成
				console.debug(" -> ol");
				$currentList = $("<ol>");
			}
			// リスト項目を作成
			console.debug(" -> ol>li");
			$currentBlock = $("<li>");
			// リストにリスト要素を追加
			$currentList.append( $currentBlock );
			inlineText = matches[1];
			isList = true;
			
		} else if ($currentList !== null && $currentList[0].tagName === "OL") {
			// OLリストを保持していて、現在の要素がリスト以外場合はリスト書出＆初期化
			allowAppendList = true;
		}
		
		// 引用
		matches = line.match(/^>(.+)/);
		if (matches !== null && matches.length === 2) {
			// 新しい引用ブロックを作成/追加
			if ($currentQuote === null) {
				// 初見の場合は引用ブロック要素を作成
				console.debug(" -> blockquote");
				$currentQuote = $("<blockquote>");
			}
			// 子要素を作成
			console.debug(" -> blockquote>div");
			$currentBlock = $("<div>");
			// 引用ブロックに子要素を追加
			$currentQuote.append( $currentBlock );
			inlineText = matches[1];
			
		} else if ($currentQuote !== null) {
			// 引用ブロックを保持していて、現在の要素が引用以外場合は引用ブロック書出＆初期化
			allowAppendQuote = true;
		}
		
		// テーブル
		matches = line.match(/^\|(.+)/);
		if (matches !== null && matches.length === 2) {
			// 新しいテーブルを作成/追加
			if ($currentTable === null) {
				// 初見の場合はテーブル要素を作成
				console.debug(" -> table");
				$currentTable = $("<table>");
			}
			// テーブル項目を作成
			console.debug(" -> table>tr>td");
			// "|"区切りでセル処理(末尾の"|"を無視するため、分割した後の末尾の要素は無視)
			var cells = matches[1].split("|");
			var $tbody = $("<tbody>");
			var $tr = $("<tr>")
			for (var i = 0; i < cells.length - 1; i++) {
				$currentBlock = $("<td>");
				var inlineHTML = slide.parser.getInlineHtml(cells[i]);
				var $td = $("<td>")
				$td.html(inlineHTML);
				// テーブルにテーブル要素を追加
				$tr.append( $td );
				inlineText = matches[1];
			}
			$tbody.append( $tr );
			$currentTable.append( $tbody );
			
			continue;
			
		} else if ($currentTable !== null) {
			// テーブルを保持していて、現在の要素がテーブル以外場合はテーブル書出＆初期化
			allowAppendTable = true;
		}
		
		// コード（シンタックスハイライト）
		matches = line.match(/^#code\(\)\{\{/);
		if (matches !== null && matches.length === 1) {
			// 新しいコード領域を作成
			if ($currentCode === null) {
				// 初見の場合はテーブル要素を作成
				console.debug(" -> code");
				$currentCode = $("<pre>").addClass("prettyprint").addClass("linenums");
			}
			
			continue;
			
		} else if ($currentCode !== null && line.match(/^\}\}/)) {
			// コード領域を保持していて、かつコード領域の閉じ指定があった場合は
			// コード領域書出
			allowAppendCode = true;
			
			continue;
			
		} else if ($currentCode !== null) {
			// 子要素を作成
			console.debug(" -> code>div");
			$currentBlock = $("<div>");
			var inlineText = line.replace(/\t/g, slide.ops.find("tab").html());
			// 引用ブロックに子要素を追加
			$currentCode.append( inlineText + "\n" );
			
			continue;
			
		}
		
		// 連続ブロック要素解析 - end ------------------------------------------
		
		// メタ要素解析 - begin ------------------------------------------------
		// 空白行は2行連続で改行とする
		matches = line.match(/.+/);
		if (matches === null) {
			// 空白行をカウントアップ
			returnCount++;
			// 空白行が2行目以上連続していれば改行
			if (returnCount >= 2) {
				console.debug(" -> br");
				// 新しい見出しを追加
				$currentBlock = $("<br/>");
				$currentPage.append($currentBlock);
			}
			continue;
			
		} else {
			// 空白行でない場合は空白行カウントを初期化
			returnCount = 0;
		}
		
		// コメント行はスキップ
		matches = line.match(/^\/\/(.+)/);
		if (matches !== null) {
			console.debug(" -> COMMENT: " + matches[1]);
			continue;
		}
		
		// メタデータ
		matches = line.match(/^META: (.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> META");
			// 背景
			var background = matches[1].match(/background=(.+)/);
			if (background !== null && background.length === 2) {
				$currentPage.css({background:background[1]});
			}
			// 文字
			var color = matches[1].match(/color=(.+)/);
			if (color !== null && color.length === 2) {
				$currentPage.css({color:color[1]});
			}
			// タイトル
			var title = matches[1].match(/title=(.+)/);
			if (title !== null && title.length === 2) {
				$("title").text(title[1]);
			}
			continue;
		}
		
		// ページ区切り ==
		matches = line.match(/^==+/);
		if (matches !== null && matches.length === 1) {
			console.debug(" -> page");
			// 既存のページからページ数を取得し、ID命名
			var pageCount = $root.find("article.page").length;
			var id = "page" + pageCount;
			// 新しいページを追加
			var $page = $("<article>").id(id).addClass("page");
			$root.append($page);
			$currentPage = $page;
			continue;
		}
		// メタ要素解析 - end --------------------------------------------------
		
		// ブロック要素解析 - begin --------------------------------------------
		
		// 区切り線 --
		matches = line.match(/^--+/);
		if (matches !== null && matches.length === 1) {
			console.debug(" -> hr");
			// 新しい見出しを追加
			$currentBlock = $("<hr>");
			$currentPage.append($currentBlock);
			continue;
		}
		
		// 見出し：レベル１ # 文字列
		matches = line.match(/^# (.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> h1");
			// 新しい見出しを作成
			$currentBlock = $("<h1>");
			inlineText = matches[1];
		}
		
		// 見出し：レベル２ ## 文字列
		matches = line.match(/^## (.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> h2");
			// 新しい見出しを作成
			$currentBlock = $("<h2>");
			inlineText = matches[1];
		}
		
		// 見出し：レベル３ ### 文字列
		matches = line.match(/^### (.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> h3");
			// 新しい見出しを作成
			$currentBlock = $("<h3>");
			inlineText = matches[1];
		}
		
		// 見出し：レベル４ #### 文字列
		matches = line.match(/^#### (.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> h4");
			// 新しい見出しを作成
			$currentBlock = $("<h4>");
			inlineText = matches[1];
		}
		
		// 見出し：レベル５ ##### 文字列
		matches = line.match(/^##### (.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> h5");
			// 新しい見出しを作成
			$currentBlock = $("<h5>");
			inlineText = matches[1];
		}
		
		// 見出し：レベル６ ###### 文字列
		matches = line.match(/^###### (.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> h6");
			// 新しい見出しを追加
			$currentBlock = $("<h6>");
			inlineText = matches[1];
		}

		matches = line.match(/^svg(.+)/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> svg");
			// svg要素を追加
			$currentBlock = $('<svg width="600" height="300">');
			inlineText = '<line x1="10" y1="10" x2="100" y2="100" stroke="white"/></svg>';
		}
		
		// ブロック要素解析 - end ----------------------------------------------
		
		// ブロック要素以外の場合は<div>を作成
		if (inlineText == null) {
			inlineText = line;
			$currentBlock = $("<div>");
			$currentBlock.addClass("line");
		}
		
		// インラインHTMLを初期化
		var inlineHTML = inlineText;
		
		// インライン要素解析 - begin ------------------------------------------
		
		// 引用はインライン処理をしない
		if ($currentQuote == null) {
			// インライン要素Lを解析
			inlineHTML = slide.parser.getInlineHtml(inlineHTML);
		}
		
		// タブ文字
		inlineHTML = inlineHTML.replace(/\t/g, slide.ops.find("tab").html());
		
		// インライン要素解析 - end --------------------------------------------
		
		if ($currentList !== null || $currentQuote !== null) {
			$currentBlock.html(inlineHTML);
		} else {
			$currentPage.append( $currentBlock.html(inlineHTML) );
		}
	}
	
	console.groupEnd();
	
	return $root.html();
}

//------------------------------------------------------------------------------
// インラインテキストをインラインHTMLに変換
slide.parser.getInlineHtml = function(inlineText) {
	
	var inlineHTML = inlineText;
	
	// 強い強調（太字） **文字列**
	var getBoldHtml = function() {
		var matches = inlineHTML.match(/\*\*(.+?)\*\*/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> strong");
			// HTMLを置換
			var partHTML = "<strong>" + matches[1] + "</strong>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getBoldHtml();
		}
	};
	getBoldHtml();
	
	// 強調（斜体） *文字列*
	var getItalicHtml = function() {
		var matches = inlineHTML.match(/\*(.+?)\*/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> em");
			// HTMLを置換
			var partHTML = "<em>" + matches[1] + "</em>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getItalicHtml();
		}
	};
	getItalicHtml();
	
	// 取り消し線 -文字列-
	var getStrikeHtml = function() {
		var matches = inlineHTML.match(/--(.+?)--/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> s");
			// HTMLを置換
			var partHTML = "<s>" + matches[1] + "</s>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getStrikeHtml();
		}
	};
	getStrikeHtml();
	
	// 上線 __文字列__
	var getUpperlineHtml = function() {
		var matches = inlineHTML.match(/__(.+?)__/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> overline");
			// HTMLを置換
			var partHTML = "<span class='overline'>" + matches[1] + "</span>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getUpperlineHtml();
		}
	};
	getUpperlineHtml();
	
	// 下線 _文字列_
	var getUnderlineHtml = function() {
		var matches = inlineHTML.match(/_(.+?)_/);
		if (matches !== null && matches.length === 2) {
			console.debug(" -> underline");
			// HTMLを置換
			var partHTML = "<span class='underline'>" + matches[1] + "</span>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getUnderlineHtml();
		}
	};
	getUnderlineHtml();
	
	// 文字背景色 &color(文字色,背景色){文字列};
	var getTextBackgroundHtml = function() {
		var matches = inlineHTML.match(/&color\((.*?),(.+?)\)\{(.+?)\};/);
		if (matches !== null && matches.length === 4) {
			console.debug(" -> font color + background");
			// HTMLを置換
			var partHTML = "<span style='color:" + matches[1] + "; background:" + matches[2] + "'>" + matches[3] + "</span>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getTextBackgroundHtml();
		}
	};
	getTextBackgroundHtml();
	
	
	// 文字色 &color(文字色){文字列};
	var getColorHtml = function() {
		var matches = inlineHTML.match(/&color\((.+?)\)\{(.+?)\};/);
		if (matches !== null && matches.length === 3) {
			console.debug(" -> font color");
			// HTMLを置換
			var partHTML = "<span style='color:" + matches[1] + "'>" + matches[2] + "</span>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getColorHtml();
		}
	};
	getColorHtml();
	
	// 文字サイズ &size(文字サイズ){文字列};
	var getFontSizeHtml = function() {
		var matches = inlineHTML.match(/&size\((.+?)\)\{(.+?)\};/);
		if (matches !== null && matches.length === 3) {
			console.debug(" -> font size");
			// HTMLを置換
			var partHTML = "<span style='font-size:" + matches[1] + "'>" + matches[2] + "</span>";
			inlineHTML = inlineHTML.replace(matches[0], partHTML);
			getFontSizeHtml();
		}
	};
	getFontSizeHtml();
	
	
	return inlineHTML;
};
//============================================================================//

//[EOF]