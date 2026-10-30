import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./SuggestionList-A_Yw7dv9.js";var i,a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),i=t(),{expect:a,fn:o,waitFor:s}=__STORYBOOK_MODULE_TEST__,c={component:r,title:`Display/Suggestion List`,tags:[`autodocs`],decorators:[e=>(0,i.jsx)(`div`,{className:`ctx-blue bg-surface w-[340px] p-4`,children:(0,i.jsx)(e,{})})]},l={today:`2026-10-21`,dueCount:3,groups:[{reason:`overdue`,total:2,items:[{id:`p3`,title:`Adele Guldpeng`,contextColor:`blue`,due:`2026-08-28`,tags:[`familj`,`barn`]},{id:`p4`,title:`Byt munstycke tandborste`,contextColor:`blue`,due:`2026-10-20`,tags:[`hem`]}]},{reason:`due_today`,total:1,items:[{id:`p5`,title:`Köp: Kattmat och sand`,contextColor:`blue`,due:`2026-10-21`,tags:[`köp`]}]},{reason:`left_from_yesterday`,total:1,items:[{id:`p6`,title:`Hem: fixa knarrande dörr`,contextColor:`blue`,due:null,tags:[`hem`]}]}],onAdd:o(),onAddAllDue:o()},u={args:l},d={args:{...l,groups:[],dueCount:0}},f={args:l,play:async({args:e,canvas:t,userEvent:n})=>{let r=t.getByRole(`button`,{name:`Add Adele Guldpeng to My Day`});await n.click(r),await a(e.onAdd).not.toHaveBeenCalled(),await a(r.closest(`.slab-leave`)).toHaveClass(`slab-leaving`),await s(()=>a(e.onAdd).toHaveBeenCalledWith(`p3`,`overdue`)),await n.click(t.getByTestId(`suggestion-list__add-all-due`)),await s(()=>a(e.onAddAllDue).toHaveBeenCalled())}},p=[`Default`,`Empty`,`AddSuggestion`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: defaultArgs
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...defaultArgs,
    groups: [],
    dueCount: 0
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: defaultArgs,
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    const add = canvas.getByRole("button", {
      name: "Add Adele Guldpeng to My Day"
    });
    await userEvent.click(add);
    // The card slides out of the panel before the task is added.
    await expect(args.onAdd).not.toHaveBeenCalled();
    await expect(add.closest(".slab-leave")).toHaveClass("slab-leaving");
    await waitFor(() => expect(args.onAdd).toHaveBeenCalledWith("p3", "overdue"));
    await userEvent.click(canvas.getByTestId("suggestion-list__add-all-due"));
    await waitFor(() => expect(args.onAddAllDue).toHaveBeenCalled());
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{f as AddSuggestion,u as Default,d as Empty,p as __namedExportsOrder,c as default};