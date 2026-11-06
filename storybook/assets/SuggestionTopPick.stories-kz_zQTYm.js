import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./SuggestionTopPick-BgzgcVR8.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),{expect:a,fn:o}=__STORYBOOK_MODULE_TEST__,s={component:r,title:`Display/Suggestion List/Suggestion Top Pick`,tags:[`autodocs`],decorators:[e=>(0,i.jsx)(`div`,{className:`ctx-blue bg-surface w-[340px] p-4`,children:(0,i.jsx)(e,{})})],args:{item:{id:`p4`,title:`Byt munstycke tandborste`,contextColor:`blue`,contextName:`Personal`,important:!0,tags:[`hem`],reason:`overdue`,why:{type:`overdue`,days:3},kinds:[`overdue`,`important`]},isLeaving:!1,onAdd:o(),onSnooze:o(),onOpen:o()}},c={play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`button`,{name:`Add to My Day`})),await a(e.onAdd).toHaveBeenCalled(),await n.click(t.getByRole(`button`,{name:`Not today`})),await a(e.onSnooze).toHaveBeenCalled(),await n.click(t.getByRole(`button`,{name:`Edit task: Byt munstycke tandborste`})),await a(e.onOpen).toHaveBeenCalled()}},l={args:{item:{id:`p3`,title:`Vattna blommorna`,contextColor:`blue`,contextName:`Personal`,important:!1,tags:[],reason:`overdue`,why:{type:`stale`,days:65},kinds:[`overdue`]}}},u=[`Default`,`Stale`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Add to My Day"
    }));
    await expect(args.onAdd).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", {
      name: "Not today"
    }));
    await expect(args.onSnooze).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", {
      name: "Edit task: Byt munstycke tandborste"
    }));
    await expect(args.onOpen).toHaveBeenCalled();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      id: "p3",
      title: "Vattna blommorna",
      contextColor: "blue",
      contextName: "Personal",
      important: false,
      tags: [],
      reason: "overdue",
      why: {
        type: "stale",
        days: 65
      },
      kinds: ["overdue"]
    }
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as Default,l as Stale,u as __namedExportsOrder,s as default};