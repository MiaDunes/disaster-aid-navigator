/* ============================================================
   MVP ENGINE. Per spec 3.2 there is no LLM here: programs come from the
   data registry below, and status comes only from the deterministic evaluator.
   Registry stands in for the verified data layer (OpenFEMA/SBA/state feeds).
   ============================================================ */
const DATA_VERSION = '2026.10.22';
const PROGRAMS = [
  { id:'fema_ihp', name:'FEMA Individuals & Households Program', kind:'Grant', reviewed:'2026-09',
    blurb:'Help with temporary housing, home repair or replacement, and other disaster needs that insurance does not cover.',
    source:'https://www.fema.gov/assistance/individual/program/eligibility',
    apply:'https://www.disasterassistance.gov', applyLabel:'Apply at DisasterAssistance.gov',
    gates:[
      {label:'Your county has a federal disaster declaration that includes individual aid', field:'declared', pass:['yes'], fail:['no'], failText:'FEMA has not opened individual assistance for your county. Some declarations cover only local governments. If household aid is added later, this can change.'},
      {label:'The damaged home is your primary residence', field:'primaryResidence', pass:['yes'], fail:['no'], failText:'FEMA individual aid is for primary residences, not second homes or rentals you own.'},
      {label:'At least one person in your household, including a child, is a citizen, national, or qualified immigrant', field:'citizenship', pass:['yes'], fail:['no'], failText:'FEMA needs at least one qualifying household member. Nonprofit help below does not have this rule.'},
      {label:'You have damage to your home, belongings, or disaster-related personal expenses', field:'lossType', anyOf:['structure','property','medical'], failText:'FEMA individual aid does not cover lost business income. See the SBA option.'},
      {eventBlock:true, hidden:true, onlyState:'tx', field:'txEvent',
        failMap:{flood26:"FEMA denied individual assistance for the July 2026 Texas storms and flooding in a September 28 letter. The governor's office says it is reviewing an appeal.", storms24:"FEMA's registration window for the 2024 Texas disasters closed long ago. The state housing programs below are the main help now."},
        unknownMap:{flood25:'FEMA is still taking registrations for the July 2025 Hill Country flooding (check fema.gov/disaster/4879)'}},
      {eventBlock:true, hidden:true, onlyState:'wa', field:'waEvent',
        failMap:{flood25:"FEMA's deadline for the December 2025 Washington floods was June 10, 2026."},
        unknownMap:{wildfire26:"FEMA has approved Washington's September 28, 2026 request for household aid after the wildfires"}}
    ],
    notes:[
      {when:{field:'insurance',eq:'not-filed'}, text:'File your insurance claim now. FEMA cannot pay for losses insurance covers, and having a claim on record helps.'},
      {when:{field:'insurance',eq:'filed'}, text:'Keep your claim number handy. FEMA looks at what is still unmet after insurance.'},
      {when:{field:'insurance',eq:'unsure'}, text:'Check with your insurer or landlord about coverage before applying.'},
      {when:{field:'ownRent',eq:'rent'}, text:'Renters can qualify for rental help and personal property losses.'},
      {when:{field:'state',eq:'tx'}, text:'If FEMA denies or does not advance your application, you can appeal. Legal aid groups such as Texas RioGrande Legal Aid help with FEMA appeals.'},
      {always:true, cats:['likely','possibly'], text:'For disasters declared on or after October 1, 2025, the most FEMA can give is $44,800 for housing and $44,800 for other needs, and most households get far less. A one-time $790 Serious Needs payment may come first.'},
      {always:true, cats:['likely','possibly'], text:'FEMA does not open household aid in every declared disaster, and in 2026 it has said states should carry more of the recovery. Apply to every program that could fit.'}
    ]},
  { id:'sba_disaster', name:'SBA Disaster Loans', kind:'Loan (repaid)', reviewed:'2026-09',
    blurb:'Low-interest loans for homeowners, renters, and businesses. Open to people without a business. This is a loan you repay, and you can apply to FEMA at the same time.',
    source:'https://www.sba.gov/disaster/',
    apply:'https://www.sba.gov/disaster/', applyLabel:'Start at SBA Disaster Loan Assistance',
    gates:[
      {label:'Your area is covered by an SBA or federal disaster declaration', field:'declared', pass:['yes'], fail:['no'], soft:true, failText:'SBA loans need a declaration for your area. This can change if one is added.'},
      {label:'The damaged home is your primary residence (or you have a business loss)', field:'primaryResidence', pass:['yes'], fail:['no'], unlessLoss:'business', failText:'The homeowner and renter loans are for primary residences. A business loss may still qualify.'},
      {label:'You have property damage or a business loss', field:'lossType', anyOf:['structure','property','business'], failText:'SBA disaster loans cover physical damage and business losses.'},
      {eventBlock:true, hidden:true, onlyState:'tx', field:'txEvent',
        failMap:{flood25:"SBA's deadlines for the July 2025 Texas floods have passed.", storms24:"SBA's deadlines for the 2024 Texas disasters have passed."},
        unknownMap:{flood26:'SBA has opened home and personal property loans for your county (check sba.gov/disaster)'}},
      {eventBlock:true, hidden:true, onlyState:'wa', field:'waEvent',
        failMap:{flood25:"SBA's deadline for property-damage loans after the December 2025 Washington floods was April 27, 2026."},
        unknownMap:{wildfire26:'SBA has opened loans for your county after the wildfires (check sba.gov/disaster)'}}
    ],
    notes:[
      {when:{field:'ownRent',eq:'rent'}, text:'Renters can borrow for personal property. Repairing the building itself is the owner\'s side.'},
      {when:{field:'lossType',has:'business'}, text:'You listed business or self-employment income loss. SBA has a separate business track, so mention it when you apply.'},
      {always:true, text:'You do not need to be denied by SBA before FEMA will look at your case. Apply to both at the same time.'},
      {always:true, text:'SBA confirms eligibility details, such as your status and credit history, when you apply. This screening cannot see those.'},
      {always:true, cats:['likely','possibly'], text:'SBA loans can be open even when FEMA does not open household aid. Homeowners can borrow up to $500,000 to repair a primary home and up to $100,000 for belongings, and renters up to $100,000 for belongings, according to SBA announcements.'}
    ]},
  { id:'red_cross', name:'American Red Cross disaster assistance', kind:'Grant', reviewed:'2026-09', cap:'possibly',
    blurb:'Financial help for households with major damage. It does not require FEMA approval first, is not a loan, and does not reduce other benefits.',
    source:'https://www.redcross.org/get-help/disaster-relief-and-recovery-services.html',
    apply:'https://www.redcross.org/get-help/disaster-relief-and-recovery-services.html', applyLabel:'See Red Cross disaster help',
    gates:[
      {label:'The damaged home is your primary residence', field:'primaryResidence', pass:['yes'], fail:['no'], failText:'Red Cross home assistance focuses on primary residences.'},
      {label:'Your home was seriously damaged, or you were displaced', field:'livable', pass:['no'], fail:['yes'], soft:true, failText:'Red Cross help usually goes to homes with major damage. If yours was badly damaged but livable, it may still apply.'}
    ],
    notes:[
      {when:{field:'citizenship',eq:'no'}, text:'Good to know: Red Cross help is not limited by citizenship or immigration status.'},
      {always:true, text:'Red Cross often contacts affected households directly instead of taking open applications. Only trust contact from the Red Cross phone numbers and website you find yourself, and never pay anyone to get help.'}
    ]},
  { id:'state_local', name:'State and local disaster programs', kind:'Varies', reviewed:'2026-09', alwaysManual:true,
    blurb:'Many states and counties run programs that fill gaps FEMA leaves. They differ place to place.',
    source:'https://www.211.org', apply:'https://www.211.org', applyLabel:'Call or search 211',
    gates:[], notes:[
      {always:true, text:'We do not have verified state program data yet, so we cannot screen this for you. 211 can tell you what your state and county offer.'}
    ]}
];
const DOCS = {
  fema_ihp:[['Photo ID and Social Security number','FEMA asks for these on the real application. This tool never does.'],['Proof you lived there (a bill, lease, or mortgage statement)',''],['Insurance information and claim number, if any',''],['Contact info and a bank account for direct deposit','']],
  sba_disaster:[['Recent tax return or income information',''],['Insurance policy details and claim status',''],['Property address and ownership or lease details','']],
  red_cross:[['Photo ID',''],['Proof of your address before the disaster','']],
  tx_hap:[['Proof you owned the home and lived there when the 2024 disaster hit',''],['Proof of legal status and identity','A federal requirement for this program. The GLO has forms for it.'],['Proof of at least $8,000 in damage from the 2024 disasters','An inspector verifies the damage.'],['Proof your mortgage, property taxes and child support are current',''],['Flood insurance, if you had earlier federal housing help or earn over 120% of area median income',''],['The official document checklist','The program page on glo.texas.gov has the full checklist and forms.']],
  tx_hrp:[['Receipts or proof of payment for the repairs you already made',''],['Proof you owned the home and lived there when the 2024 disaster hit',''],['Proof of legal status and identity','A federal requirement for this program. The GLO has forms for it.'],['Proof of at least $3,000 in damage from the 2024 disasters',''],['Proof your property taxes and child support are current, or an active payment plan',''],['The official document checklist','The program page on glo.texas.gov has the full checklist and forms.']],
  fl_hrrp:[['Photo ID and proof of citizenship or lawful residence','Required by Rebuild Florida for past storms. Check the current list.'],['Income records for every adult in the household',''],['Proof of ownership and that it was your primary residence',''],['Proof of all insurance on the home, with policy numbers','']],
  wa_wildfire26:[['Proof of identity',''],['Proof you lived in the damaged home',''],['Proof of the damage from the wildfire','']],
  wa_waia:[['Proof of insurance',''],['Unmet Needs Assessment','Complete it online, by phone, or at a Disaster Assistance Center when the program is open.']]
};
/* The 27 counties covered by the GLO's 2024-disaster programs (source: glo.texas.gov/disaster-recovery/apply) */
const TXC = ['anderson','bell','brazoria','caldwell','cooke','dallas','denton','fort-bend','galveston','guadalupe','hardin','hays','henderson','hockley','jasper','kaufman','liberty','matagorda','montgomery','newton','polk','san-jacinto','smith','trinity','tyler','walker','wharton'];
const STATE_NAMES = {ca:'California', tx:'Texas', ok:'Oklahoma', wa:'Washington', fl:'Florida'};
const STATE_PROGRAMS = {
  tx:[
   { id:'tx_hap', state:'tx', name:'Texas Homeowner Assistance Program (Texas General Land Office)', kind:'Grant', reviewed:'2026-10', cap:'possibly',
     blurb:'Repairs or rebuilds owner-occupied homes damaged in the 2024 storms, tornadoes, flooding and Hurricane Beryl, in 27 counties. Run by the Texas General Land Office with federal HUD funds, first come, first served, and only for a main home.',
     source:'https://www.glo.texas.gov/disaster-recovery/2024HAP', apply:'https://www.glo.texas.gov/disaster-recovery/2024HAP', applyLabel:'See the Homeowner Assistance Program',
     gates:[
       {label:'You own the home', field:'ownRent', pass:['own'], fail:['rent','other'], failText:'This program is for homeowners. Renters can ask 211 about rental help.'},
       {label:'The damaged home is your primary residence', field:'primaryResidence', pass:['yes'], fail:['no'], failText:'Texas GLO programs cover the primary residence only.'},
       {label:'Your home is in one of the 27 counties the program covers', field:'txCounty', pass:TXC, fail:['harris-houston','other'], failText:'Your county is not one of the 27 covered counties. Houston and Harris County run their own programs for the 2024 disasters.'},
       {label:'You lived in the home when the 2024 disaster hit', field:'_residency', pass:['yes']},
       {label:'Your home had at least $8,000 in verified damage from the 2024 disasters', field:'_damage', pass:['yes']},
       {label:'You can provide the required proof, including legal status, ownership, and current mortgage, property tax and child support payments', field:'_docs', pass:['yes']}
     ],
     notes:[
       {always:true, text:'The GLO says these are federal rules it cannot waive, and missing documents lead to a denial, so gather everything before you start.'},
       {always:true, text:'If repairs would cost more than $90,000, the program rebuilds the home instead of repairing it. You must keep the home as your main residence, and keep paying taxes and insurance, for three years.'},
       {always:true, text:'You can apply for either this program or the reimbursement program, not both. Help line: 1-844-893-8937 (weekdays, 8 a.m. to 5 p.m.). Language help: 512-463-5139.'}
     ] },
   { id:'tx_hrp', state:'tx', name:'Texas Homeowner Reimbursement Program (Texas General Land Office)', kind:'Grant', reviewed:'2026-10', cap:'possibly',
     blurb:'Pays you back for out-of-pocket home repairs you already made after the 2024 disasters: $3,000 to $75,000 for a site-built home, or $3,000 to $50,000 for a manufactured home.',
     source:'https://www.glo.texas.gov/disaster-recovery/2024HRP', apply:'https://www.glo.texas.gov/disaster-recovery/2024HRP', applyLabel:'See the Reimbursement Program',
     gates:[
       {label:'You own the home', field:'ownRent', pass:['own'], fail:['rent','other'], failText:'This program is for homeowners. Renters can ask 211 about rental help.'},
       {label:'The damaged home is your primary residence', field:'primaryResidence', pass:['yes'], fail:['no'], failText:'Texas GLO programs cover the primary residence only.'},
       {label:'Your home is in one of the 27 counties the program covers', field:'txCounty', pass:TXC, fail:['harris-houston','other'], failText:'Your county is not one of the 27 covered counties. Houston and Harris County run their own programs for the 2024 disasters.'},
       {label:'You already paid for repairs to your home out of pocket', field:'_repairs', pass:['yes']},
       {label:'Your home had at least $3,000 in damage from the 2024 disasters', field:'_damage', pass:['yes']},
       {label:'You can provide the required proof, including legal status, ownership, and current mortgage, property tax and child support payments', field:'_docs', pass:['yes']}
     ],
     notes:[{always:true, text:'Choose either reimbursement or repair help, not both. You must keep ownership, residency, property taxes and insurance for one year.'}] },
   { id:'tx_flood26', state:'tx', name:'July 2026 Texas storms and flooding: what is open', kind:'Varies', reviewed:'2026-10', alwaysManual:true,
     blurb:"FEMA approved help for local governments in 23 counties but denied individual assistance for households in a September 28 letter, and the governor's office says it is reviewing an appeal. The state extended SNAP replacement benefits and asked for federal tax relief, and local recovery groups and nonprofits are helping households.",
     source:'https://www.fema.gov/disaster/4935', apply:'https://www.fema.gov/disaster/4935', applyLabel:"See FEMA's page for DR-4935",
     gates:[], notes:[{always:true, text:"If FEMA later opens household aid, you will have a limited time to register, so watch FEMA's page. Keep every receipt and photo of the damage."}] },
   { id:'tx_flood25', state:'tx', name:'July 2025 Hill Country flood recovery help', kind:'Varies', reviewed:'2026-10', alwaysManual:true,
     blurb:'FEMA opened individual assistance for the July 2025 Hill Country flooding under DR-4879. FEMA and SBA application windows were set months ago, so check each site for anything still open. Local long-term recovery groups and nonprofits are helping fill gaps.',
     source:'https://www.fema.gov/disaster/4879', apply:'https://www.fema.gov/disaster/4879', applyLabel:"See FEMA's page for DR-4879",
     gates:[], notes:[{always:true, text:'Many Kerr County applicants were not advanced or found eligible by FEMA, so keep every letter you get and appeal if you disagree.'}] },
   { id:'tx_general', state:'tx', name:'Texas disaster recovery programs (Texas General Land Office)', kind:'Varies', reviewed:'2026-10', alwaysManual:true,
     blurb:'The GLO runs housing recovery programs for specific federally declared disasters. The programs open now are for the 2024 storms, tornadoes, flooding and Hurricane Beryl. For other events, ask 211 or your county emergency management office.',
     source:'https://www.glo.texas.gov/disaster-recovery/apply', apply:'https://www.glo.texas.gov/disaster-recovery/apply', applyLabel:'See Texas GLO recovery programs',
     gates:[], notes:[{always:true, text:'Texas programs usually open months after a disaster, so check back.'}] }
  ],
  fl:[{ id:'fl_hrrp', state:'fl', name:'Rebuild Florida 2023 and 2024 Storms Housing Repair and Replacement Program', kind:'Grant', reviewed:'2026-10', cap:'possibly',
    blurb:"A state-run, federally funded program that repairs, replaces or rebuilds homes, including mobile homes, damaged by Hurricanes Debby, Helene, Idalia and Milton or the May 2024 North Florida tornadoes. It prioritizes lower-income households, seniors, children and people with disabilities.",
    source:'https://rebuildflorida.gov', apply:'https://rebuildflorida.gov', applyLabel:'See Rebuild Florida',
    gates:[
      {label:'You own the home', field:'ownRent', pass:['own'], fail:['rent','other'], failText:'This program is for homeowners. Renters can contact FloridaCommerce Community Services and Community Action Agencies.'},
      {label:'The damaged home is your primary residence', field:'primaryResidence', pass:['yes'], fail:['no'], failText:'Rebuild Florida covers the home you lived in, not second homes or rentals you own.'},
      {label:'Your storm and county are covered by an open program', field:'_open', pass:['yes']},
      {label:"Your household meets the program's low-to-moderate income limits", field:'_income', pass:['yes']},
      {label:'Your home still has documented, unrepaired storm damage', field:'_unrepaired', pass:['yes']}
    ],
    notes:[{always:true, text:'Florida has run separate programs for different storms, so which one applies depends on your storm.'}] }],
  wa:[
   { id:'wa_wildfire26', state:'wa', name:'Washington State Individual Assistance: 2026 wildfires', kind:'Grant', reviewed:'2026-10', cap:'possibly',
     deadline:{iso:'2026-10-30', name:'Washington wildfire household grant'},
     blurb:'A state Household Needs Grant for people whose primary home was destroyed or seriously damaged and is uninhabitable after the 2026 wildfires: $750 for one person, $1,500 for two to four people, and $2,250 for five or more. The state said you can apply regardless of income or insurance.',
     source:'https://mil.wa.gov/for-individuals-households-businesses', apply:'https://mil.wa.gov/for-individuals-households-businesses', applyLabel:"See Washington's disaster help page",
     gates:[
       {label:'The damaged home is your primary residence', field:'primaryResidence', pass:['yes'], fail:['no'], failText:'The Washington program covers the primary residence only.'},
       {label:'Your home was severely damaged or destroyed', field:'lossType', anyOf:['structure'], failText:'The state program helps households whose home was severely damaged or destroyed.'},
       {label:'Your home is uninhabitable', field:'livable', pass:['no'], fail:['yes'], failText:'The grant is for homes that are destroyed or seriously damaged and uninhabitable.'},
       {label:'Your home is in an eligible county or on tribal land (the list has grown, so check the state page)', field:'_county', pass:['yes']},
       {label:'Your damage came from an eligible 2026 wildfire', field:'_fire', pass:['yes']}
     ],
     notes:[
       {always:true, text:'Apply online, by calling 2-1-1, or at a State Individual Assistance Service Center. Have proof of identity, proof you lived there, and proof of the damage. The listed deadline is October 30, 2026.'},
       {always:true, text:'Washington asked FEMA on September 28, 2026 for household aid. If FEMA approves it, you can apply to both.'}
     ] },
   { id:'wa_flood25', state:'wa', name:'December 2025 Washington flooding: help has closed', kind:'Varies', reviewed:'2026-10', alwaysManual:true,
     blurb:"The state's household grant closed April 27, 2026, and FEMA's registration for disaster DR-4906 closed June 10, 2026. Ask 211 or your county about local recovery help that may still be open.",
     source:'https://mil.wa.gov/december-2025-atmospheric-river-flooding', apply:'https://mil.wa.gov/december-2025-atmospheric-river-flooding', applyLabel:"See Washington's disaster help page",
     gates:[], notes:[] },
   { id:'wa_waia', state:'wa', name:'Washington State Individual Assistance Program', kind:'Grant', reviewed:'2026-10', cap:'possibly',
    blurb:"A state-funded program from Washington's Emergency Management Division that fills gaps when federal individual assistance is not approved. It turns on only for specific disasters and places, so check whether it is open for yours.",
    source:'https://mil.wa.gov/for-individuals-households-businesses', apply:'https://mil.wa.gov/for-individuals-households-businesses', applyLabel:"See Washington's disaster help page",
    gates:[
      {label:'The damaged home is your primary residence', field:'primaryResidence', pass:['yes'], fail:['no'], failText:'The Washington program covers the primary residence only.'},
      {label:'Your home was severely damaged or destroyed', field:'lossType', anyOf:['structure'], failText:'The state program helps households whose home was severely damaged or destroyed.'},
      {label:'The program has been turned on for your disaster and county', field:'_active', pass:['yes']},
      {label:"Your household income is within the program's limit", field:'_income', pass:['yes']}
    ],
    notes:[{always:true, text:'Proof of insurance and an Unmet Needs Assessment are required. You can apply to SBA at the same time.'}] }
  ],
  ca:[{ id:'ca_info', state:'ca', name:'California state and county disaster help', kind:'Varies', reviewed:'2026-10', alwaysManual:true,
    blurb:"Cal OES supports FEMA aid in declared counties. California's state disaster fund (CDAA) pays local governments and nonprofits, not households.",
    source:'https://www.news.caloes.ca.gov/understanding-individual-assistance-and-public-assistance-3/', apply:'https://www.news.caloes.ca.gov/understanding-individual-assistance-and-public-assistance-3/', applyLabel:'See how Cal OES explains aid',
    gates:[], notes:[{always:true, text:'California has no state grant program for households, and a 2023 bill to create one (AB 513) did not pass. Your county emergency services office and 211 can tell you about local help.'}] }],
  ok:[{ id:'ok_info', state:'ok', name:'Oklahoma state and local disaster help', kind:'Varies', reviewed:'2026-10', alwaysManual:true,
    blurb:'Oklahoma Emergency Management works with FEMA and SBA after declared disasters and has helped residents register for state and federal aid. We did not find a separate state grant for households.',
    source:'https://oklahoma.gov/oem.html', apply:'https://oklahoma.gov/oem.html', applyLabel:'Visit Oklahoma Emergency Management',
    gates:[], notes:[{always:true, text:'Ask 211 about county and volunteer programs near you.'}] }]
};
function programsFor(a){
  const base = PROGRAMS.filter(p=>p.id!=='state_local');
  const pick = (list, ids) => list.filter(p=>ids.includes(p.id));
  if (a.state==='tx'){
    const tx = STATE_PROGRAMS.tx;
    if (a.txEvent==='flood26') return base.concat(pick(tx,['tx_flood26']));
    if (a.txEvent==='storms24') return base.concat(pick(tx,['tx_hap','tx_hrp']));
    if (a.txEvent==='flood25') return base.concat(pick(tx,['tx_flood25']));
    return base.concat(pick(tx,['tx_general']));
  }
  if (a.state==='wa'){
    const wa = STATE_PROGRAMS.wa;
    if (a.waEvent==='wildfire26') return base.concat(pick(wa,['wa_wildfire26']));
    if (a.waEvent==='flood25') return base.concat(pick(wa,['wa_flood25']));
    return base.concat(pick(wa,['wa_waia']));
  }
  const sp = STATE_PROGRAMS[a.state];
  return base.concat(sp && sp.length ? sp : PROGRAMS.filter(p=>p.id==='state_local'));
}


function runGate(g, a){
  if (g.eventBlock){
    if (g.onlyState && a.state!==g.onlyState) return 'pass';
    const ev = a[g.field];
    if (g.failMap && g.failMap[ev]) return 'fail';
    if (g.unknownMap && g.unknownMap[ev]) return 'unknown';
    return 'pass';
  }
  let v = a[g.field];
  let r;
  if (g.anyOf){
    if (!Array.isArray(v) || v.length===0) r='unknown';
    else r = v.some(x=>g.anyOf.includes(x)) ? 'pass':'fail';
  } else {
    if (v===undefined) r='unknown';
    else if (g.pass.includes(v)) r='pass';
    else if (g.fail && g.fail.includes(v)) r='fail';
    else r='unknown';
  }
  if (r==='fail' && g.unlessLoss && Array.isArray(a.lossType) && a.lossType.includes(g.unlessLoss)) r='unknown';
  if (r==='fail' && g.soft) r='unknown';
  return r;
}
function evaluate(prog, a){
  if (prog.alwaysManual) return {cat:'check', gates:[]};
  const gates = prog.gates.map(g=>({g, r:runGate(g,a)}));
  let cat;
  if (gates.some(x=>x.r==='fail')) cat='not';
  else if (gates.some(x=>x.r==='unknown')) cat='possibly';
  else cat='likely';
  if (cat==='likely' && prog.cap==='possibly') cat='possibly';
  return {cat, gates};
}
function noteApplies(n,a,cat){
  if (n.cats && cat && !n.cats.includes(cat)) return false;
  if (n.always) return true;
  const v=a[n.when.field];
  if (n.when.eq!==undefined) return v===n.when.eq;
  if (n.when.has!==undefined) return Array.isArray(v)&&v.includes(n.when.has);
  return false;
}
const CAT_LABEL={likely:'Likely eligible',possibly:'Possibly eligible',check:'Check with a person',not:'Not likely for you'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function lk(href,label){ return `<a href="${href}" target="_blank" rel="noopener">${label}</a>`; }
function cardHTML(prog, res){
  const lc = s => /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase()+s.slice(1) : s;
  const why = res.gates.filter(({g,r})=>!(g.hidden && r==='pass')).map(({g,r})=>{
    const ev = answers[g.field];
    const failTxt = g.failMap ? g.failMap[ev] : g.failText;
    const lab = (g.unknownMap && g.unknownMap[ev]) ? g.unknownMap[ev] : g.label;
    let text;
    if (r==='fail') text = t(failTxt);
    else if (r==='unknown') text = LANG==='en' ? 'We need to confirm: '+lc(lab) : t('We need to confirm:')+' '+t(lab);
    else text = t(lab);
    return `<li class="${r}">${esc(text)}</li>`;
  }).join('');
  const notes = prog.notes.filter(n=>noteApplies(n,answers,res.cat)).map(n=>`<p class="pnote">${esc(t(n.text))}</p>`).join('');
  const btn = res.cat==='not' ? '' : `<a class="applybtn" href="${prog.apply}" target="_blank" rel="noopener">${esc(t(prog.applyLabel))}</a>`;
  return `<article class="pcard ${res.cat}">
    <div class="phead"><div>${prog.state?`<span class="statechip">${esc(t(STATE_NAMES[prog.state]))}</span><br>`:''}<h3>${esc(t(prog.name))}</h3></div><span class="tag">${esc(t(prog.kind))}</span></div>
    <span class="status ${res.cat}">${esc(t(CAT_LABEL[res.cat]))}</span>
    <p class="pblurb">${esc(t(prog.blurb))}</p>
    ${why?`<ul class="why">${why}</ul>`:''}${notes}${btn}
    <p class="src">${esc(tf('Rules reviewed {date}',{date:prog.reviewed}))} &middot; ${lk(prog.source, esc(t('official source')))}</p>
  </article>`;
}

function showPlan(keep){
  const results = programsFor(answers).map(p=>({p, res:evaluate(p, answers)}));
  const order={likely:0,possibly:1,check:2,not:3};
  results.sort((x,y)=>order[x.res.cat]-order[y.res.cat]);
  const active = results.filter(r=>r.res.cat!=='not');
  const notLikely = results.filter(r=>r.res.cat==='not');
  const nLikely = results.filter(r=>r.res.cat==='likely').length;
  const nPoss = results.filter(r=>r.res.cat==='possibly').length;
  const fmt = d => d.toLocaleDateString(LOCALE[LANG],{month:'long',day:'numeric',year:'numeric'});

  let html = `<h1>${esc(t('Your recovery plan'))}</h1>`;
  html += `<p class="sub">${esc(tf('{a} likely, {b} possible. These are estimates from what you told us, not decisions. Only the agencies themselves can approve or deny anything.',{a:nLikely,b:nPoss}))}</p>`;

  if (answers.urgent==='yes') html += `<div class="callout urgent"><strong>${esc(t('Need help right now?'))}</strong> ${tf('Call {link} for shelter, food, and medical help. Everything below can wait until you are safe.',{link:lk('https://www.211.org','211')})}</div>`;

  let dl = tf('Aid deadlines are set by your disaster declaration, and FEMA\'s is often around 60 days. Confirm the exact date for your disaster at {link}, and do not wait to apply.',{link:lk('https://www.disasterassistance.gov','DisasterAssistance.gov')});
  if (answers.date){
    const d = new Date(answers.date+'T00:00:00');
    if(!isNaN(d)){
      const target = new Date(d.getTime()+60*86400000);
      const left = Math.ceil((target-new Date())/86400000);
      dl += ' ' + (left>=0
        ? tf('As a cautious target, counting 60 days from your disaster date gives <strong>{when}</strong> ({left} days from today).',{when:fmt(target),left})
        : tf('Counting 60 days from your disaster date would be {when}, which has passed, so check your actual deadline right away. Deadlines vary by declaration.',{when:fmt(target)}));
    }
  }
  const dlines = active.map(r=>r.p).filter(p=>p.deadline).map(p=>{
    const d = new Date(p.deadline.iso+'T23:59:00'); const left = Math.ceil((d-new Date())/86400000);
    return left>=0 ? tf('Deadline: {name} closes {when} ({left} days from today). Check the official page, since deadlines can change.',{name:t(p.deadline.name),when:fmt(d),left}) : '';
  }).filter(Boolean);
  if (dlines.length) html += `<div class="callout urgent"><strong>${esc(t('Deadline soon'))}</strong> ${esc(dlines.join(' '))}</div>`;
  html += `<div class="callout deadline"><strong>${esc(t('Watch the clock.'))}</strong> ${dl}</div>`;
  html += `<h2>${esc(t('Results at a glance'))}</h2><div class="glance">` + results.map(r=>`<div class="grow"><span>${esc(t(r.p.name))}</span><span class="status ${r.res.cat}">${esc(t(CAT_LABEL[r.res.cat]))}</span></div>`).join('') + '</div>';

  html += `<h2>${esc(t('Where to start'))}</h2>` + active.map(r=>cardHTML(r.p,r.res)).join('');
  if (notLikely.length) html += `<details><summary>${esc(tf('{n} not likely for your situation',{n:notLikely.length}))}</summary>${notLikely.map(r=>cardHTML(r.p,r.res)).join('')}</details>`;

  const docIds = active.map(r=>r.p.id).filter(id=>DOCS[id]);
  if (docIds.length){
    const seen=new Set(); const items=[];
    docIds.forEach(id=>DOCS[id].forEach(d=>{ if(!seen.has(d[0])){seen.add(d[0]);items.push(d);} }));
    html += `<h2>${esc(t('Gather these'))}</h2><ul class="docs">` + items.map(d=>`<li><div>${esc(t(d[0]))}${d[1]?`<small>${esc(t(d[1]))}</small>`:''}</div></li>`).join('') + '</ul>';
  }

  html += `<div class="actions"><button id="planHelp" style="font-family:Manrope,sans-serif;font-size:14.5px;font-weight:700;padding:13px 24px;border-radius:11px;border:none;background:var(--primary);color:#F6F2E8;cursor:pointer;">${esc(t('Get help applying'))}</button><button class="btn btn-primary" id="planPrint" style="font-family:Manrope,sans-serif;font-size:14.5px;font-weight:700;padding:13px 24px;border-radius:11px;border:none;background:var(--primary);color:#F6F2E8;cursor:pointer;">${esc(t('Print or save this plan'))}</button></div>`;
  html += `<p class="fine"><strong>${esc(t('This is a navigation tool, not an application.'))}</strong> ${esc(tf('Nothing here was sent to FEMA, SBA, your state, or the Red Cross. Statuses come from fixed rules reviewed against official pages (data {v}), and program details change with each disaster, so confirm at the official links.',{v:DATA_VERSION}))} <span class="scam">${esc(t('Anyone who asks you to pay for help applying for disaster aid is not legitimate.'))}</span></p>`;

  document.getElementById('planBody').innerHTML = html;
  document.getElementById('planPrint').addEventListener('click',()=>window.print());
  document.getElementById('planHelp').addEventListener('click',openConsent);
  document.getElementById('quizView').style.display='none';
  document.getElementById('planView').style.display='block';
  if(!keep) window.scrollTo({top:0});
}
/* ---- consent / contact agreement (in-memory only; no storage, no network) ---- */
const cm=document.getElementById('consentModal');
const cf=id=>document.getElementById(id);
let consentRecord=null, consentFocus=null;
function validateConsent(){
  const contact = cf('cPhone').value.trim() || (cf('cEmail').value.trim() && cf('cEmail').checkValidity());
  const emailOk = !cf('cEmail').value.trim() || cf('cEmail').checkValidity();
  cf('cSubmit').disabled = !(cf('cName').value.trim() && contact && emailOk && cf('c1').checked && cf('c2').checked);
}
function openConsent(){
  consentFocus=document.activeElement;
  cf('consentForm').style.display='block'; cf('consentDone').style.display='none';
  const noPlan = Object.keys(answers).length===0;
  cf('cLede').textContent = noPlan
    ? "If you'd rather talk to a person than use the questionnaire, a disaster case manager can contact you to help you apply. It's your choice, and you can use the questionnaire on this page instead."
    : t("If you'd like a person to help you apply, we can pass along your plan so a disaster case manager can contact you. It's your choice, and you can skip this and use the links on your plan instead.");
  cf('cShareItem').textContent = noPlan ? 'Nothing else. You have not answered any questions yet.' : t('Your questionnaire answers and the plan results');
  cf('c1Text').textContent = noPlan
    ? 'I agree that Disaster Aid Navigator may share my name and contact details with a disaster case manager so they can contact me about help.'
    : t('I agree that Disaster Aid Navigator may share my name, contact details, and plan with a disaster case manager so they can contact me about help.');
  cm.style.display='flex'; validateConsent(); cf('cName').focus();
}
function closeConsent(){ cm.style.display='none'; if(consentFocus&&consentFocus.focus) consentFocus.focus(); }
['cName','cPhone','cEmail','c1','c2'].forEach(id=>{cf(id).addEventListener('input',validateConsent);cf(id).addEventListener('change',validateConsent);});
cf('cCancel').addEventListener('click',closeConsent);
/* ---- first-open household citizenship question (feeds questionnaire step 5; in-memory only) ---- */
const zm=document.getElementById('citizenModal');
function answerCitizen(v){
  if(v!=='skip'){ const o=document.querySelector('[data-group="citizenship"] .opt[data-value="'+v+'"]'); if(o) o.click(); }
  zm.style.display='none';
  const inp=document.getElementById('agentInput'); if(inp) inp.focus();
}
zm.querySelectorAll('[data-cz]').forEach(b=>b.addEventListener('click',()=>answerCitizen(b.dataset.cz)));
document.addEventListener('keydown',e=>{
  if(zm.style.display!=='flex') return;
  if(e.key==='Escape') answerCitizen('skip');
  if(e.key==='Tab'){
    const f=[...zm.querySelectorAll('button')]; const first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
/* ---- language picker (first open) then citizenship question ---- */
const lm=document.getElementById('langModal');
const lsel=document.getElementById('langSel');
[['en','English'],['es','Español'],['zh','中文（简体）'],['tl','Tagalog'],['vi','Tiếng Việt']].forEach(([c,n])=>{const o=document.createElement('option');o.value=c;o.textContent=n;lsel.appendChild(o);});
lsel.addEventListener('change',()=>setLang(lsel.value));
function pickLang(c){ setLang(c); lm.style.display='none'; zm.style.display='flex'; zm.querySelector('[data-cz]').focus(); }
lm.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>pickLang(b.dataset.lang)));
(function(){ const n=(navigator.language||'en').toLowerCase(); const g = n.startsWith('es')?'es':n.startsWith('zh')?'zh':(n.startsWith('fil')||n.startsWith('tl'))?'tl':n.startsWith('vi')?'vi':null;
  if(g){ const b=lm.querySelector('[data-lang="'+g+'"]'); if(b) b.classList.add('guess'); } })();
document.addEventListener('keydown',e=>{
  if(lm.style.display!=='flex') return;
  if(e.key==='Escape') pickLang('en');
  if(e.key==='Tab'){
    const f=[...lm.querySelectorAll('button')]; const first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
document.querySelectorAll('[data-group="state"] .opt').forEach(o=>o.addEventListener('click',()=>{ document.getElementById('txExtra').style.display = answers.state==='tx' ? 'block' : 'none'; document.getElementById('waExtra').style.display = answers.state==='wa' ? 'block' : 'none'; }));
document.getElementById('txCounty').addEventListener('change',e=>{ answers.txCounty = e.target.value || undefined; });
lsel.value='en';
lm.style.display='flex'; (lm.querySelector('.guess')||lm.querySelector('button')).focus();
cf('cDoneBtn').addEventListener('click',closeConsent);
cf('cSubmit').addEventListener('click',()=>{
  consentRecord={name:cf('cName').value.trim(),phone:cf('cPhone').value.trim(),email:cf('cEmail').value.trim(),language:cf('cLang').value,method:cf('cMethod').value,agreedAt:new Date().toISOString(),answers:JSON.parse(JSON.stringify(answers))};
  const first=consentRecord.name.split(' ')[0];
  cf('cDoneText').textContent=tf('Thanks, {name}. In the live version, a case manager would contact you by {method} in {lang}. In this preview nothing was sent, so keep using the links on your plan to apply.',{name:first,method:t(consentRecord.method).toLowerCase(),lang:t(consentRecord.language)});
  cf('consentForm').style.display='none'; cf('consentDone').style.display='block'; cf('cDoneBtn').focus();
});
cm.addEventListener('click',e=>{ if(e.target===cm) closeConsent(); });
document.addEventListener('keydown',e=>{
  if(cm.style.display!=='flex') return;
  if(e.key==='Escape') closeConsent();
  if(e.key==='Tab'){
    const f=[...cm.querySelectorAll('input,select,button')].filter(x=>!x.disabled&&x.offsetParent!==null);
    if(!f.length) return; const first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
document.getElementById('planEdit').addEventListener('click',()=>{
  document.getElementById('planView').style.display='none';
  document.getElementById('quizView').style.display='block';
  current = steps.length-1; showStep(current);
  window.scrollTo({top:0});
});
document.getElementById('planRestart').addEventListener('click',()=>location.reload());
