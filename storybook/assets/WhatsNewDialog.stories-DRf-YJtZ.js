import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,r as n}from"./react-intl-A4R07ucy.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./button-BrFzn3Nr.js";import{n as o,t as s}from"./chip-CCfXQvZ5.js";import{n as c,t as l}from"./modal-CqbeO4fv.js";function u({emoji:e,title:t,description:n}){return(0,f.jsxs)(`li`,{className:`flex gap-3`,children:[(0,f.jsx)(`span`,{"aria-hidden":!0,className:`bg-default flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg`,children:e}),(0,f.jsxs)(`div`,{className:`flex min-w-0 flex-col`,children:[(0,f.jsx)(`span`,{className:`text-sm font-semibold`,children:t}),(0,f.jsx)(`span`,{className:`text-muted text-sm`,children:n})]})]})}function d({isOpen:e,appName:n,releases:r,onClose:i}){let o=t();return(0,f.jsx)(l,{isOpen:e,onOpenChange:e=>!e&&i(),children:(0,f.jsx)(l.Backdrop,{variant:`blur`,children:(0,f.jsx)(l.Container,{size:`md`,scroll:`inside`,children:(0,f.jsxs)(l.Dialog,{"data-testid":`whats-new`,children:[(0,f.jsxs)(l.Header,{children:[(0,f.jsx)(l.Heading,{children:o.formatMessage({description:`WhatsNewDialog - heading`,defaultMessage:`🎉 What's new in {appName}`,id:`mXIq3Z`},{appName:n})}),(0,f.jsx)(l.CloseTrigger,{})]}),(0,f.jsx)(l.Body,{className:`flex flex-col gap-6`,children:r.map(e=>(0,f.jsxs)(`section`,{className:`flex flex-col gap-4`,children:[(0,f.jsx)(s,{size:`sm`,variant:`soft`,color:`accent`,className:`self-start`,children:o.formatMessage({description:`WhatsNewDialog - version label above a release's notes`,defaultMessage:`Version {version}`,id:`fFBFA3`},{version:e.version})}),e.highlights.length>0&&(0,f.jsx)(`ul`,{className:`flex flex-col gap-4`,children:e.highlights.map(e=>(0,f.jsx)(u,{...e},e.title))}),e.fixes.length>0&&(0,f.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,f.jsx)(`h3`,{className:`text-muted text-xs font-medium tracking-wide uppercase`,children:o.formatMessage({description:`WhatsNewDialog - heading above the list of fixed bugs`,defaultMessage:`🐛 Bugs squashed`,id:`KAcMYs`})}),(0,f.jsx)(`ul`,{className:`flex flex-col gap-4`,children:e.fixes.map(e=>(0,f.jsx)(u,{...e},e.title))})]})]},e.version))}),(0,f.jsx)(l.Footer,{children:(0,f.jsx)(a,{variant:`primary`,onPress:i,children:o.formatMessage({description:`WhatsNewDialog - button that closes the dialog`,defaultMessage:`Let's go! 🚀`,id:`7G5r47`})})})]})})})})}var f;function p(){return(p=e((()=>{i(),o(),c(),n(),f=r(),d.__docgenInfo={description:``,methods:[],displayName:`WhatsNewDialog`,props:{isOpen:{required:!0,tsType:{name:`boolean`},description:``},appName:{required:!0,tsType:{name:`string`},description:``},releases:{required:!0,tsType:{name:`Array`,elements:[{name:`WhatsNewRelease`}],raw:`WhatsNewRelease[]`},description:`Newest first.`},onClose:{required:!0,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``}}}})))()}var m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{p(),{expect:m,fn:h,within:g}=__STORYBOOK_MODULE_TEST__,_={component:d,title:`Feedback/Whats New Dialog`,tags:[`autodocs`],parameters:{layout:`fullscreen`}},v={version:`0.2.0`,highlights:[{emoji:`✏️`,title:`Edit tasks in place`,description:`Click any task to tweak its title, due date, reminder, tags, links and notes.`},{emoji:`🐙`,title:`Sync through GitHub`,description:`Keep your tasks in a private repository and sync from any browser. Yes, even your phone!`}],fixes:[{emoji:`🤫`,title:`Quieter GitHub sync`,description:`Klart no longer makes a commit every half hour just to say it's still around.`}]},y={version:`0.1.0`,highlights:[{emoji:`🖥️`,title:`Klart on your desktop`,description:`A proper app for macOS, Windows and Linux, with native notifications.`}],fixes:[]},b={isOpen:!0,appName:`Klart`,releases:[v],onClose:h()},x={args:b,play:async({args:e})=>{let t=g(document.body);await m(await t.findByText(`Edit tasks in place`)).toBeInTheDocument(),await m(t.getByText(`Version 0.2.0`)).toBeInTheDocument(),await m(t.getByText(/Bugs squashed/)).toBeInTheDocument(),t.getByRole(`button`,{name:/Let's go/}).click(),await m(e.onClose).toHaveBeenCalled()}},S={args:{...b,releases:[v,y]},play:async()=>{let e=g(document.body);await m(await e.findByText(`Version 0.2.0`)).toBeInTheDocument(),await m(e.getByText(`Version 0.1.0`)).toBeInTheDocument()}},C={args:{...b,releases:[y]},play:async()=>{let e=g(document.body);await m(await e.findByText(`Klart on your desktop`)).toBeInTheDocument(),await m(e.queryByText(/Bugs squashed/)).toBeNull()}},w={args:{...b,releases:[v,y]},globals:{viewport:{value:`iphonex`}}},T=[`Default`,`SeveralVersions`,`HighlightsOnly`,`Phone`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args
  }) => {
    const body = within(document.body);
    await expect(await body.findByText("Edit tasks in place")).toBeInTheDocument();
    await expect(body.getByText("Version 0.2.0")).toBeInTheDocument();
    await expect(body.getByText(/Bugs squashed/)).toBeInTheDocument();
    body.getByRole("button", {
      name: /Let's go/
    }).click();
    await expect(args.onClose).toHaveBeenCalled();
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    releases: [latest, previous]
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Version 0.2.0")).toBeInTheDocument();
    await expect(body.getByText("Version 0.1.0")).toBeInTheDocument();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    releases: [previous]
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByText("Klart on your desktop")).toBeInTheDocument();
    await expect(body.queryByText(/Bugs squashed/)).toBeNull();
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    releases: [latest, previous]
  },
  globals: {
    viewport: {
      value: "iphonex"
    }
  }
}`,...w.parameters?.docs?.source}}}})))()}E();export{x as Default,C as HighlightsOnly,w as Phone,S as SeveralVersions,T as __namedExportsOrder,_ as default};