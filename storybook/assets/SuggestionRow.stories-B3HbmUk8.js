import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{i as n,r}from"./SuggestionRow-DH0qb7uW.js";var i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),i=t(),{expect:a,fn:o}=__STORYBOOK_MODULE_TEST__,s={component:r,title:`Display/Suggestion List/Suggestion Row`,tags:[`autodocs`],decorators:[e=>(0,i.jsx)(`div`,{className:`ctx-blue bg-surface w-[340px] p-4`,children:(0,i.jsx)(e,{})})],args:{item:{id:`p5`,title:`Köp: Kaffe och filter`,contextColor:`blue`,contextName:`Personal`,important:!1,tags:[`köp`],reason:`due_today`,why:{type:`due_today`},kinds:[`soon`]},isLeaving:!1,onAdd:o(),onSnooze:o(),onOpen:o()}},c={play:async({args:e,canvas:t,userEvent:n})=>{await n.click(t.getByRole(`button`,{name:`Add Köp: Kaffe och filter to My Day`})),await a(e.onAdd).toHaveBeenCalled(),await n.click(t.getByRole(`button`,{name:`Edit task: Köp: Kaffe och filter`})),await a(e.onOpen).toHaveBeenCalled()}},l={args:{item:{id:`p4`,title:`Byt munstycke tandborste`,contextColor:`blue`,contextName:`Personal`,important:!0,tags:[],reason:`overdue`,why:{type:`overdue`,days:3},kinds:[`overdue`,`important`]}}},u={args:{isLeaving:!0}},d=[`Default`,`Important`,`Leaving`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole("button", {
      name: "Add Köp: Kaffe och filter to My Day"
    }));
    await expect(args.onAdd).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", {
      name: "Edit task: Köp: Kaffe och filter"
    }));
    await expect(args.onOpen).toHaveBeenCalled();
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      id: "p4",
      title: "Byt munstycke tandborste",
      contextColor: "blue",
      contextName: "Personal",
      important: true,
      tags: [],
      reason: "overdue",
      why: {
        type: "overdue",
        days: 3
      },
      kinds: ["overdue", "important"]
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    isLeaving: true
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{c as Default,l as Important,u as Leaving,d as __namedExportsOrder,s as default};