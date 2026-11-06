import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./ShoppingView-DpiZUuOR.js";import{r,t as i}from"./ShoppingCategory-D_TZQ9qs.js";import{a,d as o,f as s,i as c,l,r as u}from"./KlartDemoData-BpXO25Dc.js";function d(e){return e.kind===`home`?{name:`Work`,color:`orange`}:{name:`Personal`,color:`blue`}}function f(e,t=!1){return{id:e.id,name:e.name,kind:e.kind,color:l[e.kind],date:e.date,total:e.items.length,bought:e.items.filter(e=>e.bought).length,isCompleted:!!e.completedAt,context:t?d(e):null}}function p(e){return{id:e.id,name:e.name,qty:e.qty,total:s(e),link:e.link,note:e.note,bought:e.bought,important:e.important,isInMyDay:!!e.taskId&&C.has(e.taskId)}}function m(e,t=!1){let n=e.items.filter(e=>!e.bought),r=e.kind===`grocery`?i.map(e=>({category:e,items:n.filter(t=>t.category===e).map(p)})).filter(e=>e.items.length>0):[{category:null,items:n.map(p)}],a=e.items.map(s).filter(e=>e!==null);return{...f(e,t),completedAt:e.completedAt,sum:a.length?a.reduce((e,t)=>e+t,0):null,groups:r,boughtItems:e.items.filter(e=>e.bought).map(p)}}function h(e,t=!1){return{today:c,openLists:S.filter(e=>!e.completedAt).map(e=>f(e,t)),doneLists:S.filter(e=>e.completedAt).map(e=>f(e,t)),selected:m(S[e],t),isListShownOnPhone:!0,onSelectList:_(),onBackToLists:_(),newList:{onCreate:_()},draft:{value:``,onChange:_(),onSubmit:_(),preview:null},moveTargets:S.filter((t,n)=>n!==e&&!t.completedAt),itemEditor:{item:null,color:l[S[e].kind],showCategory:S[e].kind===`grocery`,onChange:_(),onClose:_()},listActions:{onOpenItem:_(),onToggleBought:_(),onToggleImportant:_(),onToggleItemMyDay:_(),onRemoveItem:_(),onComplete:_(),onReopen:_(),onRename:_(),onDelete:_()}}}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{t(),r(),o(),a(),{expect:g,fn:_,screen:v,userEvent:y,waitFor:b}=__STORYBOOK_MODULE_TEST__,x={component:n,title:`Views/Shopping`,tags:[`autodocs`],parameters:{layout:`fullscreen`}},S=Object.values(u.lists),C=new Set(Object.keys(u.tasks)),w={args:h(0),play:async({canvas:e})=>{await g(e.getByTestId(`shopping__list-name`)).toHaveTextContent(`Veckohandling`),await g(e.getByRole(`heading`,{name:`Dairy`})).toBeVisible()}},T={args:h(0),play:async({canvas:e})=>{await g(e.queryByTestId(`shopping__list-context`)).toBeNull(),await g(e.queryAllByTestId(`shopping-list-card__context`)).toHaveLength(0)}},E={args:h(0,!0),play:async({canvas:e})=>{await g(e.getByTestId(`shopping__list-context`)).toHaveTextContent(`Personal`);let t=e.getAllByTestId(`shopping-list-card__context`).map(e=>e.textContent);await g(t).toContain(`Personal`),await g(t).toContain(`Work`)}},D={args:h(1)},O={args:{...h(0),draft:{value:`2x mjölk 25 kr`,onChange:_(),onSubmit:_(),preview:{name:`mjölk`,qty:2,price:25,linkHost:null,category:`dairy`}}},play:async({canvas:e})=>{await g(e.getByTestId(`shopping__item-preview`)).toHaveTextContent(`to Dairy`)}},k=h(0),A=S[0].items[0],j={args:{...k,itemEditor:{...k.itemEditor,item:{...A,isInMyDay:!1}}},play:async()=>{await g(await v.findByTestId(`shopping-item-editor__name`)).toHaveValue(A.name)}},M={args:h(0),play:async({canvas:e,args:t})=>{e.getByTestId(`shopping__complete-list`).click(),await b(()=>g(e.getByTestId(`shopping__complete-dialog`)).toBeVisible()),e.getByTestId(`shopping__complete-anyway`).click(),await g(t.listActions.onComplete).toHaveBeenCalledWith(null)}},N={args:h(0),play:async({canvas:e,args:t})=>{await y.click(e.getByTestId(`shopping__list-menu`)),await y.click(await v.findByTestId(`shopping__rename-list`));let n=await e.findByTestId(`shopping__rename-input`);await g(n).toHaveValue(`Veckohandling`),await y.clear(n),await y.type(n,`Helgen{Enter}`),await g(t.listActions.onRename).toHaveBeenCalledWith(`Helgen`),await g(e.getByTestId(`shopping__list-name`)).toBeVisible()}},P={args:h(0),play:async({canvas:e,args:t})=>{await y.click(e.getByTestId(`shopping__list-menu`)),await y.click(await v.findByTestId(`shopping__delete-list`)),await b(()=>g(e.getByTestId(`shopping__delete-dialog`)).toBeVisible()),await g(e.getByTestId(`shopping__delete-dialog`)).toHaveTextContent(`Delete “Veckohandling”?`),await y.click(e.getByTestId(`shopping__delete-confirm`)),await g(t.listActions.onDelete).toHaveBeenCalled()}},F={args:h(3),play:async({canvas:e})=>{await g(e.getByTestId(`shopping__reopen-list`)).toBeVisible()}},I={args:{...h(0),openLists:[],doneLists:[],selected:null}},L=[`Groceries`,`OneContext`,`AllContexts`,`Gifts`,`Typing`,`EditItem`,`CompleteWithItemsLeft`,`Rename`,`Delete`,`CompletedList`,`Empty`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    ...groceries,
    itemEditor: {
      ...groceries.itemEditor,
      item: {
        ...editedItem,
        isInMyDay: false
      }
    }
  },
  play: async () => {
    await expect(await screen.findByTestId("shopping-item-editor__name")).toHaveValue(editedItem.name);
  }
}`,...j.parameters?.docs?.source},description:{story:`An item open in the editor: a pane beside the list on wide screens, a sheet on narrow ones.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: buildArgs(3),
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByTestId("shopping__reopen-list")).toBeVisible();
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...buildArgs(0),
    openLists: [],
    doneLists: [],
    selected: null
  }
}`,...I.parameters?.docs?.source}}}})))()}R();export{E as AllContexts,M as CompleteWithItemsLeft,F as CompletedList,P as Delete,j as EditItem,I as Empty,D as Gifts,w as Groceries,T as OneContext,N as Rename,O as Typing,L as __namedExportsOrder,x as default};