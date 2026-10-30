import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./ShoppingView-VcrdgrKP.js";import{a as r,d as i,f as a,i as o,l as s,m as c,p as l,r as u}from"./KlartDemoData-30YlAmCj.js";function d(e){return e.kind===`home`?{name:`Work`,color:`orange`}:{name:`Personal`,color:`blue`}}function f(e,t=!1){return{id:e.id,name:e.name,kind:e.kind,color:s[e.kind],date:e.date,total:e.items.length,bought:e.items.filter(e=>e.bought).length,isCompleted:!!e.completedAt,context:t?d(e):null}}function p(e){return{id:e.id,name:e.name,qty:e.qty,total:a(e),link:e.link,note:e.note,bought:e.bought,important:e.important,isInMyDay:!!e.taskId&&C.has(e.taskId)}}function m(e,t=!1){let n=e.items.filter(e=>!e.bought),r=e.kind===`grocery`?l.map(e=>({category:e,items:n.filter(t=>t.category===e).map(p)})).filter(e=>e.items.length>0):[{category:null,items:n.map(p)}],i=e.items.map(a).filter(e=>e!==null);return{...f(e,t),completedAt:e.completedAt,sum:i.length?i.reduce((e,t)=>e+t,0):null,groups:r,boughtItems:e.items.filter(e=>e.bought).map(p)}}function h(e,t=!1){return{today:o,openLists:S.filter(e=>!e.completedAt).map(e=>f(e,t)),doneLists:S.filter(e=>e.completedAt).map(e=>f(e,t)),selected:m(S[e],t),isListShownOnPhone:!0,onSelectList:_(),onBackToLists:_(),newList:{onCreate:_()},draft:{value:``,onChange:_(),onSubmit:_(),preview:null},moveTargets:S.filter((t,n)=>n!==e&&!t.completedAt),listActions:{onToggleBought:_(),onToggleImportant:_(),onToggleItemMyDay:_(),onRemoveItem:_(),onComplete:_(),onReopen:_(),onRename:_(),onDelete:_()}}}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{t(),c(),i(),r(),{expect:g,fn:_,screen:v,userEvent:y,waitFor:b}=__STORYBOOK_MODULE_TEST__,x={component:n,title:`Views/Shopping`,tags:[`autodocs`],parameters:{layout:`fullscreen`}},S=Object.values(u.lists),C=new Set(Object.keys(u.tasks)),w={args:h(0),play:async({canvas:e})=>{await g(e.getByTestId(`shopping__list-name`)).toHaveTextContent(`Veckohandling`),await g(e.getByRole(`heading`,{name:`Dairy`})).toBeVisible()}},T={args:h(0),play:async({canvas:e})=>{await g(e.queryByTestId(`shopping__list-context`)).toBeNull(),await g(e.queryAllByTestId(`shopping-list-card__context`)).toHaveLength(0)}},E={args:h(0,!0),play:async({canvas:e})=>{await g(e.getByTestId(`shopping__list-context`)).toHaveTextContent(`Personal`);let t=e.getAllByTestId(`shopping-list-card__context`).map(e=>e.textContent);await g(t).toContain(`Personal`),await g(t).toContain(`Work`)}},D={args:h(1)},O={args:{...h(0),draft:{value:`2x mjölk 25 kr`,onChange:_(),onSubmit:_(),preview:{name:`mjölk`,qty:2,price:25,linkHost:null,category:`dairy`}}},play:async({canvas:e})=>{await g(e.getByTestId(`shopping__item-preview`)).toHaveTextContent(`to Dairy`)}},k={args:h(0),play:async({canvas:e,args:t})=>{e.getByTestId(`shopping__complete-list`).click(),await b(()=>g(e.getByTestId(`shopping__complete-dialog`)).toBeVisible()),e.getByTestId(`shopping__complete-anyway`).click(),await g(t.listActions.onComplete).toHaveBeenCalledWith(null)}},A={args:h(0),play:async({canvas:e,args:t})=>{await y.click(e.getByTestId(`shopping__list-menu`)),await y.click(await v.findByTestId(`shopping__rename-list`));let n=await e.findByTestId(`shopping__rename-input`);await g(n).toHaveValue(`Veckohandling`),await y.clear(n),await y.type(n,`Helgen{Enter}`),await g(t.listActions.onRename).toHaveBeenCalledWith(`Helgen`),await g(e.getByTestId(`shopping__list-name`)).toBeVisible()}},j={args:h(0),play:async({canvas:e,args:t})=>{await y.click(e.getByTestId(`shopping__list-menu`)),await y.click(await v.findByTestId(`shopping__delete-list`)),await b(()=>g(e.getByTestId(`shopping__delete-dialog`)).toBeVisible()),await g(e.getByTestId(`shopping__delete-dialog`)).toHaveTextContent(`Delete “Veckohandling”?`),await y.click(e.getByTestId(`shopping__delete-confirm`)),await g(t.listActions.onDelete).toHaveBeenCalled()}},M={args:h(3),play:async({canvas:e})=>{await g(e.getByTestId(`shopping__reopen-list`)).toBeVisible()}},N={args:{...h(0),openLists:[],doneLists:[],selected:null}},P=[`Groceries`,`OneContext`,`AllContexts`,`Gifts`,`Typing`,`CompleteWithItemsLeft`,`Rename`,`Delete`,`CompletedList`,`Empty`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: buildArgs(0),
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping__list-name")).toHaveTextContent("Veckohandling");
    await expect(canvas.getByRole("heading", {
      name: "Dairy"
    })).toBeVisible();
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: buildArgs(0),
  play: async ({
    canvas
  }) => {
    await expect(canvas.queryByTestId("shopping__list-context")).toBeNull();
    await expect(canvas.queryAllByTestId("shopping-list-card__context")).toHaveLength(0);
  }
}`,...T.parameters?.docs?.source},description:{story:`One context selected: every list is in it, so none shows its context.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: buildArgs(0, true),
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping__list-context")).toHaveTextContent("Personal");
    const labels = canvas.getAllByTestId("shopping-list-card__context").map(label => label.textContent);
    await expect(labels).toContain("Personal");
    await expect(labels).toContain("Work");
  }
}`,...E.parameters?.docs?.source},description:{story:`"All contexts": each list shows which context it belongs to, in the lists column and the list's header.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: buildArgs(1)
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...buildArgs(0),
    draft: {
      value: "2x mjölk 25 kr",
      onChange: fn(),
      onSubmit: fn(),
      preview: {
        name: "mjölk",
        qty: 2,
        price: 25,
        linkHost: null,
        category: "dairy"
      }
    }
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping__item-preview")).toHaveTextContent("to Dairy");
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: buildArgs(0),
  play: async ({
    canvas,
    args
  }) => {
    canvas.getByTestId("shopping__complete-list").click();
    await waitFor(() => expect(canvas.getByTestId("shopping__complete-dialog")).toBeVisible());
    canvas.getByTestId("shopping__complete-anyway").click();
    await expect(args.listActions.onComplete).toHaveBeenCalledWith(null);
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: buildArgs(0),
  play: async ({
    canvas,
    args
  }) => {
    await userEvent.click(canvas.getByTestId("shopping__list-menu"));
    await userEvent.click(await screen.findByTestId("shopping__rename-list"));
    const input = await canvas.findByTestId("shopping__rename-input");
    await expect(input).toHaveValue("Veckohandling");
    await userEvent.clear(input);
    await userEvent.type(input, "Helgen{Enter}");
    await expect(args.listActions.onRename).toHaveBeenCalledWith("Helgen");
    await expect(canvas.getByTestId("shopping__list-name")).toBeVisible();
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: buildArgs(0),
  play: async ({
    canvas,
    args
  }) => {
    await userEvent.click(canvas.getByTestId("shopping__list-menu"));
    await userEvent.click(await screen.findByTestId("shopping__delete-list"));
    await waitFor(() => expect(canvas.getByTestId("shopping__delete-dialog")).toBeVisible());
    await expect(canvas.getByTestId("shopping__delete-dialog")).toHaveTextContent("Delete “Veckohandling”?");
    await userEvent.click(canvas.getByTestId("shopping__delete-confirm"));
    await expect(args.listActions.onDelete).toHaveBeenCalled();
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: buildArgs(3),
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping__reopen-list")).toBeVisible();
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    ...buildArgs(0),
    openLists: [],
    doneLists: [],
    selected: null
  }
}`,...N.parameters?.docs?.source}}}})))()}F();export{E as AllContexts,k as CompleteWithItemsLeft,M as CompletedList,j as Delete,N as Empty,D as Gifts,w as Groceries,T as OneContext,A as Rename,O as Typing,P as __namedExportsOrder,x as default};