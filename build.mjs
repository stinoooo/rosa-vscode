// Writes themes/rosa-dark.json and themes/rosa-light.json from the palettes
// below, and fails when a text color drops under WCAG AA (4.5:1) on the
// editor background. The palettes come from the site tokens in
// apps/web/src/app/globals.css and apps/status/public/status.css.
//
// Run: node tools/vscode-theme/build.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const palettes = {
  dark: {
    name: 'Rosa Dark',
    type: 'dark',
    bg: '#191410', // --bg
    sunken: '#16110d', // --sunken
    band: '#12100d', // --color-band
    surface: '#1f1914', // --surface
    raised: '#241d17', // --raised
    hover: '#2b231c',
    line: '#2e261f', // --line on --bg
    edge: '#433930', // --edge on --bg
    ink: '#e6dbcd', // --ink
    muted: '#b8aa9b', // --muted
    faint: '#8f8375', // --faint
    accent: '#a8bd7f', // --accent
    onAccent: '#191410',
    forest: '#a9c08c', // --forest
    olive: '#93a86a', // --color-olive
    rose: '#dd9b9b', // --color-rose
    gold: '#d9b64a', // --color-gold
    sky: '#7fb8c9', // --maintenance, --season-monsoon
    ember: '#e0a06f', // --season-windswept
    peach: '#e8b287', // --color-warn
    sage: '#c4b898', // --season-wildfire
    danger: '#e58b8b', // --down
    warn: '#e3a06d', // --degraded
    ok: '#7fb873', // --operational
    selection: '#a8bd7f33',
    selectionInactive: '#a8bd7f1f',
    findMatch: '#d9b64a55',
    findMatchOther: '#d9b64a26',
    lineHighlight: '#211a15', // --wash
    shadow: '#00000099',
    comment: '#8f8375',
  },
  light: {
    name: 'Rosa Light',
    type: 'light',
    bg: '#f5ede5', // --bg
    sunken: '#efe6dc', // --sunken
    band: '#4a5c3d', // --color-band
    surface: '#f9f4ee', // --surface
    raised: '#fbf7f2', // --raised
    hover: '#e8dcd0', // --color-sand
    line: '#e2d6ca', // --line on --bg
    edge: '#cdbcae', // --edge on --bg
    ink: '#3b2a1f', // --ink
    muted: '#6b584b', // --muted
    faint: '#715e51', // --faint, darkened so comments pass AA
    accent: '#556232', // --accent
    onAccent: '#f5ede5',
    forest: '#4a5c3d', // --forest
    olive: '#6b7a4a', // --color-olive
    rose: '#8c4a4a', // --color-danger
    gold: '#7d5f0c', // --color-gold, darkened for text
    sky: '#3d6976', // --season-monsoon
    ember: '#8f4a20', // --season-windswept, darkened for text
    peach: '#8a4a24', // --color-warn
    sage: '#665d48', // --season-wildfire, darkened for text
    danger: '#a03d3d', // --down, darkened for text
    warn: '#c2703f', // --degraded
    ok: '#3f6e3c', // --operational, darkened for text
    selection: '#55623233',
    selectionInactive: '#5562321f',
    findMatch: '#c9a22766',
    findMatchOther: '#c9a2272e',
    lineHighlight: '#efe2d4', // --wash
    shadow: '#5c3d2e40',
    comment: '#715e51',
  },
};

function workbench(p) {
  const dark = p.type === 'dark';
  return {
    focusBorder: p.olive,
    foreground: p.ink,
    descriptionForeground: p.muted,
    disabledForeground: p.faint,
    errorForeground: p.danger,
    'icon.foreground': p.muted,
    'widget.shadow': p.shadow,
    'selection.background': p.selection,
    'textLink.foreground': dark ? p.accent : p.accent,
    'textLink.activeForeground': p.forest,
    'textBlockQuote.background': p.sunken,
    'textBlockQuote.border': p.edge,
    'textCodeBlock.background': p.sunken,
    'textPreformat.foreground': p.ember,
    'textSeparator.foreground': p.edge,

    'activityBar.background': p.band,
    'activityBar.foreground': dark ? p.ink : '#f5ede5',
    'activityBar.inactiveForeground': dark ? p.faint : '#c9d1bd',
    'activityBar.border': dark ? p.line : p.band,
    'activityBar.activeBorder': dark ? p.accent : '#f5ede5',
    'activityBarBadge.background': dark ? p.accent : '#f5ede5',
    'activityBarBadge.foreground': dark ? p.onAccent : p.band,

    'sideBar.background': p.sunken,
    'sideBar.foreground': p.ink,
    'sideBar.border': p.line,
    'sideBarTitle.foreground': p.muted,
    'sideBarSectionHeader.background': p.sunken,
    'sideBarSectionHeader.foreground': p.muted,
    'sideBarSectionHeader.border': p.line,

    'list.activeSelectionBackground': p.hover,
    'list.activeSelectionForeground': p.ink,
    'list.inactiveSelectionBackground': p.raised,
    'list.inactiveSelectionForeground': p.ink,
    'list.hoverBackground': p.raised,
    'list.hoverForeground': p.ink,
    'list.focusOutline': p.olive,
    'list.highlightForeground': p.accent,
    'list.errorForeground': p.danger,
    'list.warningForeground': p.warn,
    'tree.indentGuidesStroke': p.edge,

    'editor.background': p.bg,
    'editor.foreground': p.ink,
    'editorLineNumber.foreground': p.faint,
    'editorLineNumber.activeForeground': p.ink,
    'editorCursor.foreground': p.accent,
    'editor.selectionBackground': p.selection,
    'editor.inactiveSelectionBackground': p.selectionInactive,
    'editor.selectionHighlightBackground': p.selectionInactive,
    'editor.wordHighlightBackground': p.selectionInactive,
    'editor.wordHighlightStrongBackground': p.selection,
    'editor.findMatchBackground': p.findMatch,
    'editor.findMatchHighlightBackground': p.findMatchOther,
    'editor.lineHighlightBackground': p.lineHighlight,
    'editor.lineHighlightBorder': '#00000000',
    'editor.rangeHighlightBackground': p.selectionInactive,
    'editorWhitespace.foreground': p.edge,
    'editorIndentGuide.background1': p.line,
    'editorIndentGuide.activeBackground1': p.edge,
    'editorRuler.foreground': p.line,
    'editorBracketMatch.background': p.selectionInactive,
    'editorBracketMatch.border': p.olive,
    'editorBracketHighlight.foreground1': p.gold,
    'editorBracketHighlight.foreground2': p.rose,
    'editorBracketHighlight.foreground3': p.sky,
    'editorBracketHighlight.foreground4': p.accent,
    'editorBracketHighlight.foreground5': p.ember,
    'editorBracketHighlight.foreground6': p.sage,
    'editorBracketHighlight.unexpectedBracket.foreground': p.danger,
    'editorError.foreground': p.danger,
    'editorWarning.foreground': p.warn,
    'editorInfo.foreground': p.sky,
    'editorHint.foreground': p.accent,
    'editorLink.activeForeground': p.accent,
    'editorCodeLens.foreground': p.faint,
    'editorInlayHint.background': p.sunken,
    'editorInlayHint.foreground': p.muted,
    'editorGutter.background': p.bg,
    'editorGutter.addedBackground': p.ok,
    'editorGutter.modifiedBackground': p.sky,
    'editorGutter.deletedBackground': p.danger,
    'editorOverviewRuler.border': p.line,
    'editorGroup.border': p.line,
    'editorGroupHeader.tabsBackground': p.sunken,
    'editorGroupHeader.tabsBorder': p.line,
    'editorWidget.background': p.surface,
    'editorWidget.foreground': p.ink,
    'editorWidget.border': p.edge,
    'editorSuggestWidget.background': p.surface,
    'editorSuggestWidget.border': p.edge,
    'editorSuggestWidget.foreground': p.ink,
    'editorSuggestWidget.selectedBackground': p.hover,
    'editorSuggestWidget.highlightForeground': p.accent,
    'editorHoverWidget.background': p.surface,
    'editorHoverWidget.border': p.edge,
    'peekView.border': p.olive,
    'peekViewEditor.background': p.sunken,
    'peekViewResult.background': p.surface,
    'peekViewTitle.background': p.surface,
    'peekViewEditor.matchHighlightBackground': p.findMatch,
    'peekViewResult.matchHighlightBackground': p.findMatch,
    'diffEditor.insertedTextBackground': dark ? '#7fb87326' : '#4f8a4b26',
    'diffEditor.removedTextBackground': dark ? '#e58b8b26' : '#b5484822',
    'minimap.background': p.bg,
    'minimap.selectionHighlight': p.selection,
    'scrollbarSlider.background': dark ? '#e6dbcd1f' : '#5c3d2e24',
    'scrollbarSlider.hoverBackground': dark ? '#e6dbcd33' : '#5c3d2e38',
    'scrollbarSlider.activeBackground': dark ? '#e6dbcd47' : '#5c3d2e4d',

    'tab.activeBackground': p.bg,
    'tab.activeForeground': p.ink,
    'tab.activeBorderTop': p.accent,
    'tab.inactiveBackground': p.sunken,
    'tab.inactiveForeground': p.muted,
    'tab.hoverBackground': p.raised,
    'tab.border': p.line,
    'tab.unfocusedActiveForeground': p.muted,

    'titleBar.activeBackground': p.sunken,
    'titleBar.activeForeground': p.ink,
    'titleBar.inactiveBackground': p.sunken,
    'titleBar.inactiveForeground': p.muted,
    'titleBar.border': p.line,

    'statusBar.background': p.band,
    'statusBar.foreground': dark ? p.muted : '#f5ede5',
    'statusBar.border': dark ? p.line : p.band,
    'statusBar.noFolderBackground': p.band,
    'statusBar.debuggingBackground': dark ? '#3a2a1c' : '#8a4a24',
    'statusBar.debuggingForeground': dark ? p.peach : '#f5ede5',
    'statusBarItem.hoverBackground': dark ? '#ffffff14' : '#ffffff1f',
    'statusBarItem.remoteBackground': dark ? p.accent : '#f5ede5',
    'statusBarItem.remoteForeground': dark ? p.onAccent : p.band,

    'panel.background': p.sunken,
    'panel.border': p.line,
    'panelTitle.activeForeground': p.ink,
    'panelTitle.inactiveForeground': p.muted,
    'panelTitle.activeBorder': p.accent,

    'terminal.background': p.sunken,
    'terminal.foreground': p.ink,
    'terminalCursor.foreground': p.accent,
    'terminal.selectionBackground': p.selection,
    'terminal.ansiBlack': dark ? '#2b211b' : '#3b2a1f',
    'terminal.ansiRed': p.danger,
    'terminal.ansiGreen': dark ? p.ok : '#3f6e3c',
    'terminal.ansiYellow': p.gold,
    'terminal.ansiBlue': p.sky,
    'terminal.ansiMagenta': p.rose,
    'terminal.ansiCyan': dark ? '#8fc4b8' : '#2f6b63',
    'terminal.ansiWhite': dark ? p.muted : '#6b584b',
    'terminal.ansiBrightBlack': p.faint,
    'terminal.ansiBrightRed': dark ? '#f0a8a8' : '#8c4a4a',
    'terminal.ansiBrightGreen': p.accent,
    'terminal.ansiBrightYellow': dark ? '#e8c96a' : '#8a6a12',
    'terminal.ansiBrightBlue': dark ? '#a3d0dd' : '#2f5560',
    'terminal.ansiBrightMagenta': dark ? '#e8b5b5' : '#7a3f55',
    'terminal.ansiBrightCyan': dark ? '#b0dad0' : '#245750',
    'terminal.ansiBrightWhite': p.ink,

    'input.background': p.surface,
    'input.foreground': p.ink,
    'input.border': p.edge,
    'input.placeholderForeground': p.faint,
    'inputOption.activeBorder': p.olive,
    'inputOption.activeBackground': p.selectionInactive,
    'inputValidation.errorBorder': p.danger,
    'inputValidation.warningBorder': p.warn,
    'inputValidation.infoBorder': p.sky,
    'dropdown.background': p.surface,
    'dropdown.foreground': p.ink,
    'dropdown.border': p.edge,
    'checkbox.background': p.surface,
    'checkbox.border': p.edge,

    'button.background': p.accent,
    'button.foreground': p.onAccent,
    'button.hoverBackground': p.forest,
    'button.secondaryBackground': p.raised,
    'button.secondaryForeground': p.ink,
    'button.secondaryHoverBackground': p.hover,
    'badge.background': p.accent,
    'badge.foreground': p.onAccent,
    'progressBar.background': p.accent,

    'quickInput.background': p.surface,
    'quickInput.foreground': p.ink,
    'quickInputList.focusBackground': p.hover,
    'pickerGroup.foreground': p.accent,
    'pickerGroup.border': p.line,
    'menu.background': p.surface,
    'menu.foreground': p.ink,
    'menu.selectionBackground': p.hover,
    'menu.selectionForeground': p.ink,
    'menu.separatorBackground': p.line,
    'menu.border': p.edge,
    'notifications.background': p.surface,
    'notifications.foreground': p.ink,
    'notifications.border': p.edge,
    'notificationCenterHeader.background': p.raised,

    'gitDecoration.addedResourceForeground': p.ok,
    'gitDecoration.untrackedResourceForeground': p.ok,
    'gitDecoration.modifiedResourceForeground': p.sky,
    'gitDecoration.deletedResourceForeground': p.danger,
    'gitDecoration.conflictingResourceForeground': p.warn,
    'gitDecoration.ignoredResourceForeground': p.faint,

    'breadcrumb.foreground': p.muted,
    'breadcrumb.focusForeground': p.ink,
    'breadcrumb.activeSelectionForeground': p.ink,
    'breadcrumbPicker.background': p.surface,

    'focusBorder': `${p.olive}99`,
    'sash.hoverBorder': p.olive,
    'commandCenter.background': p.surface,
    'commandCenter.foreground': p.muted,
    'commandCenter.activeBackground': p.hover,
    'commandCenter.activeForeground': p.ink,
    'commandCenter.border': p.line,
    'banner.background': p.raised,
    'banner.foreground': p.ink,
    'banner.iconForeground': p.sky,
    'keybindingLabel.background': p.raised,
    'keybindingLabel.foreground': p.ink,
    'keybindingLabel.border': p.edge,
    'keybindingLabel.bottomBorder': p.edge,

    'editorStickyScroll.background': p.bg,
    'editorStickyScroll.border': p.line,
    'editorStickyScroll.shadow': p.shadow,
    'editorStickyScrollHover.background': p.hover,
    ...Object.fromEntries(
      [p.gold, p.rose, p.sky, p.accent, p.ember, p.sage].map((c, i) => [`editorBracketPairGuide.activeBackground${i + 1}`, `${c}aa`]),
    ),
    'editorIndentGuide.background2': p.line,
    'editorIndentGuide.activeBackground2': p.edge,
    'editorGhostText.foreground': p.faint,
    'editorLightBulb.foreground': p.gold,
    'editorLightBulbAutoFix.foreground': p.accent,
    'editorUnnecessaryCode.opacity': '#000000a0',
    'editorMultiCursor.primary.foreground': p.accent,
    'editorMultiCursor.secondary.foreground': p.sage,
    'editorOverviewRuler.findMatchForeground': `${p.gold}99`,
    'editorOverviewRuler.errorForeground': p.danger,
    'editorOverviewRuler.warningForeground': p.warn,
    'editorOverviewRuler.infoForeground': p.sky,
    'editorOverviewRuler.addedForeground': `${p.ok}99`,
    'editorOverviewRuler.modifiedForeground': `${p.sky}99`,
    'editorOverviewRuler.deletedForeground': `${p.danger}99`,
    'editorOverviewRuler.bracketMatchForeground': p.olive,
    'minimap.findMatchHighlight': p.findMatch,
    'minimap.errorHighlight': `${p.danger}aa`,
    'minimap.warningHighlight': `${p.warn}aa`,
    'minimapGutter.addedBackground': p.ok,
    'minimapGutter.modifiedBackground': p.sky,
    'minimapGutter.deletedBackground': p.danger,

    'diffEditor.insertedLineBackground': dark ? '#7fb87314' : '#4f8a4b14',
    'diffEditor.removedLineBackground': dark ? '#e58b8b14' : '#b5484812',
    'diffEditor.diagonalFill': p.line,
    'diffEditorGutter.insertedLineBackground': dark ? '#7fb87333' : '#4f8a4b2e',
    'diffEditorGutter.removedLineBackground': dark ? '#e58b8b33' : '#b548482b',
    'diffEditorOverview.insertedForeground': `${p.ok}99`,
    'diffEditorOverview.removedForeground': `${p.danger}99`,
    'multiDiffEditor.headerBackground': p.surface,
    'multiDiffEditor.border': p.line,
    'merge.currentHeaderBackground': `${p.ok}55`,
    'merge.currentContentBackground': `${p.ok}1f`,
    'merge.incomingHeaderBackground': `${p.sky}55`,
    'merge.incomingContentBackground': `${p.sky}1f`,
    'merge.commonHeaderBackground': `${p.faint}55`,
    'merge.commonContentBackground': `${p.faint}1f`,
    'mergeEditor.change.background': `${p.sky}1f`,
    'mergeEditor.change.word.background': `${p.sky}33`,
    'mergeEditor.conflict.unhandledUnfocused.border': `${p.warn}99`,
    'mergeEditor.conflict.unhandledFocused.border': p.warn,
    'mergeEditor.conflict.handledUnfocused.border': `${p.ok}66`,
    'mergeEditor.conflict.handledFocused.border': p.ok,

    'debugToolBar.background': p.surface,
    'debugToolBar.border': p.edge,
    'debugIcon.breakpointForeground': p.danger,
    'debugIcon.breakpointDisabledForeground': p.faint,
    'debugIcon.breakpointUnverifiedForeground': p.warn,
    'debugIcon.breakpointCurrentStackframeForeground': p.gold,
    'debugIcon.startForeground': p.ok,
    'debugIcon.pauseForeground': p.sky,
    'debugIcon.stopForeground': p.danger,
    'debugIcon.disconnectForeground': p.danger,
    'debugIcon.restartForeground': p.ok,
    'debugIcon.stepOverForeground': p.sky,
    'debugIcon.stepIntoForeground': p.sky,
    'debugIcon.stepOutForeground': p.sky,
    'debugIcon.continueForeground': p.ok,
    'debugTokenExpression.name': p.sage,
    'debugTokenExpression.value': p.ink,
    'debugTokenExpression.string': p.accent,
    'debugTokenExpression.number': p.ember,
    'debugTokenExpression.boolean': p.ember,
    'debugTokenExpression.error': p.danger,
    'debugConsole.infoForeground': p.sky,
    'debugConsole.warningForeground': p.warn,
    'debugConsole.errorForeground': p.danger,
    'debugConsole.sourceForeground': p.muted,
    'debugConsoleInputIcon.foreground': p.accent,
    'editor.stackFrameHighlightBackground': `${p.gold}26`,
    'editor.focusedStackFrameHighlightBackground': `${p.ok}26`,

    'testing.iconPassed': p.ok,
    'testing.iconFailed': p.danger,
    'testing.iconErrored': p.danger,
    'testing.iconQueued': p.gold,
    'testing.iconUnset': p.faint,
    'testing.iconSkipped': p.faint,
    'testing.runAction': p.ok,
    'testing.peekBorder': p.danger,
    'testing.peekHeaderBackground': `${p.danger}1f`,
    'testing.message.error.lineBackground': `${p.danger}1a`,
    'testing.message.info.lineBackground': `${p.sky}1a`,
    'testing.coveredBackground': `${p.ok}1f`,
    'testing.coveredBorder': `${p.ok}55`,
    'testing.coveredGutterBackground': `${p.ok}66`,
    'testing.uncoveredBackground': `${p.danger}1a`,
    'testing.uncoveredBorder': `${p.danger}55`,
    'testing.uncoveredGutterBackground': `${p.danger}66`,

    'chat.requestBackground': p.surface,
    'chat.requestBorder': p.line,
    'chat.slashCommandBackground': `${p.accent}26`,
    'chat.slashCommandForeground': p.accent,
    'chat.avatarBackground': p.raised,
    'chat.avatarForeground': p.ink,
    'chat.editedFileForeground': p.sky,
    'inlineChat.background': p.surface,
    'inlineChat.border': p.edge,
    'inlineChat.foreground': p.ink,
    'inlineChatInput.background': p.sunken,
    'inlineChatInput.border': p.edge,
    'inlineEdit.originalBackground': `${p.danger}1a`,
    'inlineEdit.modifiedBackground': `${p.ok}1a`,

    'scmGraph.foreground1': p.gold,
    'scmGraph.foreground2': p.rose,
    'scmGraph.foreground3': p.sky,
    'scmGraph.foreground4': p.accent,
    'scmGraph.foreground5': p.ember,
    'scmGraph.historyItemRefColor': p.sky,
    'scmGraph.historyItemRemoteRefColor': p.rose,
    'scmGraph.historyItemBaseRefColor': p.ember,
    'scmGraph.historyItemHoverDefaultLabelForeground': p.ink,
    'terminal.findMatchBackground': p.findMatch,
    'terminal.findMatchHighlightBackground': p.findMatchOther,
    'terminal.border': p.line,
    'terminalCommandDecoration.defaultBackground': p.faint,
    'terminalCommandDecoration.successBackground': p.ok,
    'terminalCommandDecoration.errorBackground': p.danger,
    'terminalOverviewRuler.cursorForeground': p.accent,
    'statusBarItem.errorBackground': dark ? '#5a2626' : '#a03d3d',
    'statusBarItem.errorForeground': dark ? p.danger : '#f5ede5',
    'statusBarItem.warningBackground': dark ? '#4a3220' : '#8a4a24',
    'statusBarItem.warningForeground': dark ? p.warn : '#f5ede5',
    'statusBarItem.prominentBackground': dark ? '#ffffff14' : '#ffffff1f',

    'notebook.cellBorderColor': p.line,
    'notebook.cellEditorBackground': p.sunken,
    'notebook.focusedCellBorder': p.olive,
    'notebook.focusedEditorBorder': p.olive,
    'notebook.selectedCellBackground': p.selectionInactive,
    'notebook.cellStatusBarItemHoverBackground': p.hover,
    'notebookStatusSuccessIcon.foreground': p.ok,
    'notebookStatusErrorIcon.foreground': p.danger,
    'notebookStatusRunningIcon.foreground': p.sky,
    'charts.foreground': p.ink,
    'charts.lines': p.edge,
    'charts.red': p.danger,
    'charts.blue': p.sky,
    'charts.yellow': p.gold,
    'charts.orange': p.ember,
    'charts.green': p.ok,
    'charts.purple': p.rose,
    'problemsErrorIcon.foreground': p.danger,
    'problemsWarningIcon.foreground': p.warn,
    'problemsInfoIcon.foreground': p.sky,

    // The icons in the outline, breadcrumbs and suggestions, in the same
    // colors as the tokens they stand for.
    ...Object.fromEntries(
      Object.entries({
        sky: ['class', 'interface', 'enumerator', 'struct', 'typeParameter', 'namespace', 'module', 'package', 'enum'],
        gold: ['function', 'method', 'constructor', 'event', 'operator'],
        ember: ['constant', 'enumeratorMember', 'number', 'boolean', 'null'],
        sage: ['property', 'field', 'key'],
        accent: ['string', 'text', 'snippet'],
        rose: ['keyword', 'unit', 'color', 'reference'],
        ink: ['variable', 'array', 'object', 'file', 'folder'],
        muted: ['text'],
      }).flatMap(([color, kinds]) => kinds.map((k) => [`symbolIcon.${k}Foreground`, p[color]])),
    ),
  };
}

function tokens(p) {
  const rule = (name, scope, foreground, fontStyle) => ({
    name,
    scope,
    settings: fontStyle ? { foreground, fontStyle } : { foreground },
  });
  return [
    rule('Comments', ['comment', 'punctuation.definition.comment'], p.comment, 'italic'),
    rule('Keywords and storage', ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control'], p.rose),
    rule('Operators', ['keyword.operator', 'punctuation.accessor'], p.muted),
    rule('Punctuation', ['punctuation', 'meta.brace'], p.muted),
    rule('Strings', ['string', 'string.template', 'punctuation.definition.string'], p.accent),
    rule('Escapes and regular expressions', ['constant.character.escape', 'string.regexp'], p.sky),
    rule('Numbers and constants', ['constant.numeric', 'constant.language', 'constant.other', 'support.constant'], p.ember),
    rule('Functions', ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], p.gold),
    rule('Types and classes', ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class'], p.sky),
    rule('Variables', ['variable', 'variable.other.readwrite', 'meta.definition.variable'], p.ink),
    rule('Parameters', ['variable.parameter'], p.peach, 'italic'),
    rule('Language variables', ['variable.language'], p.rose, 'italic'),
    rule('Properties', ['variable.other.property', 'variable.other.object.property', 'support.variable.property', 'meta.object-literal.key'], p.sage),
    rule('Tags', ['entity.name.tag', 'punctuation.definition.tag'], p.rose),
    rule('Attributes', ['entity.other.attribute-name'], p.gold),
    rule('CSS properties', ['support.type.property-name.css', 'support.type.property-name'], p.sage),
    rule('Decorators', ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator'], p.peach),
    rule('Markdown headings', ['markup.heading', 'entity.name.section'], p.forest, 'bold'),
    rule('Markdown bold', ['markup.bold'], p.ink, 'bold'),
    rule('Markdown italic', ['markup.italic'], p.ink, 'italic'),
    rule('Markdown code', ['markup.inline.raw', 'markup.fenced_code'], p.ember),
    rule('Markdown links', ['markup.underline.link', 'string.other.link'], p.sky),
    rule('Markdown quotes', ['markup.quote'], p.muted, 'italic'),
    rule('Inserted', ['markup.inserted'], p.ok),
    rule('Deleted', ['markup.deleted'], p.danger),
    rule('Changed', ['markup.changed'], p.sky),
    rule('JSON keys', ['support.type.property-name.json'], p.sage),
    rule('Invalid', ['invalid', 'invalid.illegal'], p.danger),

    // What the built-in and Rosa grammars name in other languages, so every
    // language reads in the same colors: types blue, calls amber, keywords
    // rose, values orange, fields sage.
    rule('Built-in types', [
      'storage.type.primitive', 'storage.type.built-in', 'support.type.primitive', 'support.type.builtin', 'keyword.type',
      'storage.type.numeric.go', 'storage.type.string.go', 'storage.type.boolean.go', 'storage.type.byte.go', 'storage.type.rune.go',
      'storage.type.error.go', 'storage.type.uintptr.go', 'storage.type.java', 'storage.type.generic', 'storage.type.object.array.java',
      'entity.name.type.numeric', 'entity.name.type.primitive', 'storage.type.cs',
    ], p.sky),
    rule('Namespaces and modules', [
      'entity.name.namespace', 'entity.name.type.namespace', 'entity.name.scope-resolution', 'entity.name.type.module',
      'entity.name.module', 'support.other.namespace', 'support.other.module', 'entity.name.package.go', 'entity.name.import.go',
      'storage.modifier.import.java', 'storage.modifier.package.java', 'entity.name.type.package.java',
    ], p.sky),
    rule('Preprocessor', [
      'meta.preprocessor', 'keyword.control.directive', 'punctuation.definition.directive', 'keyword.other.directive',
      'meta.preprocessor.pragma', 'keyword.preprocessor',
    ], p.peach),
    rule('Macros and preprocessor names', ['entity.name.function.preprocessor', 'entity.name.function.macro', 'support.function.macro'], p.gold),
    rule('Preprocessor strings', ['meta.preprocessor.string', 'meta.preprocessor.include string', 'string.quoted.other.lt-gt.include'], p.accent),
    rule('Annotations and attributes', [
      'storage.type.annotation', 'punctuation.definition.annotation', 'meta.annotation', 'meta.attribute.rust',
      'punctuation.definition.attribute.rust', 'entity.name.function.attribute', 'meta.decorator entity.name.function',
    ], p.peach),
    rule('Lifetimes and labels', [
      'entity.name.type.lifetime', 'storage.modifier.lifetime', 'punctuation.definition.lifetime', 'entity.name.label', 'punctuation.definition.label',
    ], p.peach, 'italic'),
    rule('Calls without a function scope', ['meta.function-call.generic', 'support.function.cmake', 'entity.name.function.target.makefile'], p.gold),
    rule('Self parameters', [
      'variable.parameter.function.language.special.self', 'variable.parameter.function.language.special.cls', 'variable.language.self',
      'variable.language.this', 'variable.language.super', 'variable.language.special.self',
    ], p.rose, 'italic'),
    rule('Fields and members', [
      'variable.other.member', 'variable.other.field', 'entity.name.variable.field', 'variable.other.readwrite.instance',
      'variable.other.readwrite.class', 'variable.other.object.property', 'entity.name.variable.property',
    ], p.sage),
    rule('Library values', ['support.variable', 'support.constant', 'variable.other.constant.property'], p.ember),
    rule('Characters, entities and symbols', ['constant.character', 'constant.other.symbol', 'constant.other.caps', 'constant.other.enum', 'variable.other.enummember', 'entity.name.constant'], p.ember),
    rule('Placeholders and interpolation', [
      'constant.other.placeholder', 'constant.character.format.placeholder', 'punctuation.definition.template-expression',
      'punctuation.section.embedded', 'punctuation.definition.interpolation', 'string.interpolated.dollar punctuation',
      'variable.other.interpolated',
    ], p.sky),
    rule('Code inside strings', ['meta.embedded.interpolation', 'meta.template.expression', 'meta.embedded.line', 'source.embedded'], p.ink),
    rule('String prefixes', ['storage.type.string.python', 'storage.type.string', 'string.quoted.docstring punctuation.definition.string'], p.rose),
    rule('Docstrings', ['string.quoted.docstring', 'comment.block.documentation', 'comment.line.documentation'], p.comment, 'italic'),
    rule('Documentation tags', ['keyword.other.documentation', 'storage.type.class.jsdoc', 'punctuation.definition.block.tag.jsdoc', 'entity.name.tag.bbcode'], p.sage, 'italic'),
    rule('TODO markers', ['keyword.other.todo', 'comment keyword.codetag.notation'], p.gold, 'bold italic'),
    rule('Shell variables', ['variable.other.normal.shell', 'variable.other.positional.shell', 'variable.other.special.shell', 'punctuation.definition.variable.shell', 'variable.other.makefile', 'variable.other.cmake'], p.sage),
    rule('Variable sigils', ['punctuation.definition.variable', 'punctuation.definition.variable.php', 'punctuation.definition.variable.ruby'], p.muted),
    rule('Paths and links in code', ['string.unquoted.path', 'markup.underline.link', 'string.other.link.description'], p.sky),
    rule('Node paths', ['string.unquoted.node-path', 'punctuation.definition.node-path'], p.accent),
    rule('Signals', ['entity.name.function.signal'], p.gold, 'italic'),
    rule('Keys in data files', [
      'entity.name.tag.yaml', 'support.type.property-name.toml', 'support.type.property-name.table.toml', 'keyword.other.definition.ini',
      'support.type.property-name.gdresource', 'variable.other.property.hcl', 'variable.other.property.nix', 'entity.name.tag.toml',
    ], p.sage),
    rule('Sections in data files', ['entity.name.tag.table.toml', 'entity.name.section.group-title.ini', 'entity.name.tag.section', 'entity.name.table.toml'], p.rose, 'bold'),
    rule('Dates and times', ['constant.other.time', 'constant.other.date', 'constant.other.timestamp'], p.ember),
    rule('Godot and shader built-ins', ['support.variable.builtin', 'support.constant.render-mode', 'support.constant.shader-type'], p.ember),
    rule('Shader hints', ['entity.name.function.decorator.hint'], p.peach, 'italic'),
    rule('CSS selectors', ['entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css', 'entity.other.attribute-name.pseudo-class', 'entity.other.attribute-name.pseudo-element'], p.gold),
    rule('Units', ['keyword.other.unit'], p.ember),
    rule('Regex groups', ['string.regexp punctuation', 'keyword.operator.quantifier.regexp', 'constant.other.character-class.regexp'], p.rose),
    rule('Markdown lists', ['punctuation.definition.list.begin.markdown', 'markup.list punctuation.definition.list'], p.gold),
    rule('Markdown strikethrough', ['markup.strikethrough'], p.muted, 'strikethrough'),
    rule('Markdown code fence language', ['fenced_code.block.language'], p.muted, 'italic'),
    rule('Diff headers', ['meta.diff.header', 'meta.diff.range', 'meta.diff.index', 'punctuation.definition.from-file.diff', 'punctuation.definition.to-file.diff'], p.sky),
    rule('Log levels', ['markup.error', 'log.error'], p.danger),
    rule('Log warnings', ['markup.warning', 'log.warning'], p.warn),
    rule('Log info', ['markup.info', 'log.info'], p.sky),
  ];
}

function semantic(p) {
  return {
    namespace: p.sky,
    type: p.sky,
    class: p.sky,
    interface: p.sky,
    enum: p.sky,
    typeParameter: { foreground: p.sky, italic: true },
    function: p.gold,
    method: p.gold,
    decorator: p.peach,
    macro: p.gold,
    variable: p.ink,
    'variable.readonly': p.ink,
    'variable.defaultLibrary': p.ember,
    parameter: { foreground: p.peach, italic: true },
    property: p.sage,
    enumMember: p.ember,
    event: p.sage,
    keyword: p.rose,
    string: p.accent,
    number: p.ember,
    regexp: p.sky,
    comment: { foreground: p.comment, italic: true },

    // What rust-analyzer, Pylance, clangd, gopls and Roslyn add on top.
    struct: p.sky,
    union: p.sky,
    typeAlias: p.sky,
    builtinType: p.sky,
    concept: p.sky,
    module: p.sky,
    'class.builtin': p.sky,
    'type.defaultLibrary': p.sky,
    recordClass: p.sky,
    recordStruct: p.sky,
    delegate: p.sky,
    'function.builtin': p.gold,
    'function.defaultLibrary': p.gold,
    'method.defaultLibrary': p.gold,
    extensionMethod: p.gold,
    magicFunction: p.gold,
    selfKeyword: { foreground: p.rose, italic: true },
    selfTypeKeyword: { foreground: p.rose, italic: true },
    selfParameter: { foreground: p.rose, italic: true },
    clsParameter: { foreground: p.rose, italic: true },
    lifetime: { foreground: p.peach, italic: true },
    label: { foreground: p.peach, italic: true },
    attribute: p.peach,
    derive: p.sky,
    builtinAttribute: p.peach,
    field: p.sage,
    constant: p.ember,
    'variable.constant': p.ember,
    'variable.static': p.ember,
    boolean: p.ember,
    formatSpecifier: p.sky,
    escapeSequence: p.sky,
    operator: p.muted,
    controlKeyword: p.rose,
    preprocessorKeyword: p.peach,
    excludedCode: { foreground: p.faint, italic: true },
    unresolvedReference: { foreground: p.danger, underline: true },
    '*.deprecated': { strikethrough: true },
  };
}

// WCAG relative luminance and contrast ratio.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

let failed = false;
for (const p of Object.values(palettes)) {
  // Text colors against every background they appear on.
  const text = ['ink', 'muted', 'faint', 'comment', 'accent', 'forest', 'rose', 'gold', 'sky', 'ember', 'peach', 'sage', 'danger', 'ok'];
  const backgrounds = ['bg', 'sunken', 'surface', 'lineHighlight'];
  console.log(`\n${p.name}`);
  for (const t of text) {
    const worst = Math.min(...backgrounds.map((b) => contrast(p[t], p[b])));
    const pass = worst >= 4.5;
    if (!pass) failed = true;
    console.log(`  ${t.padEnd(8)} ${p[t]}  ${worst.toFixed(2)}:1 ${pass ? 'AA' : 'FAIL'}`);
  }
  const pairs = [
    ['button text', p.onAccent, p.accent],
    ['status bar text', workbench(p)['statusBar.foreground'], p.band],
    ['activity bar text', workbench(p)['activityBar.foreground'], p.band],
  ];
  for (const [label, fg, bg] of pairs) {
    const ratio = contrast(fg, bg);
    if (ratio < 4.5) failed = true;
    console.log(`  ${label.padEnd(18)} ${ratio.toFixed(2)}:1 ${ratio >= 4.5 ? 'AA' : 'FAIL'}`);
  }

  const theme = {
    $schema: 'vscode://schemas/color-theme',
    name: p.name,
    type: p.type,
    semanticHighlighting: true,
    colors: workbench(p),
    tokenColors: tokens(p),
    semanticTokenColors: semantic(p),
  };
  const file = join(here, 'themes', `rosa-${p.type}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(theme, null, 2)}\n`);
}

if (failed) {
  console.error('\nA text color is under 4.5:1. Adjust the palette.');
  process.exit(1);
}
console.log('\nBoth themes written.');
