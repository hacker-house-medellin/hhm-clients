import test from 'node:test';
import assert from 'node:assert/strict';
import { APPLICATION_SCOPE, createActivityVisualization, ActivityVisualizationError } from '../build/claritas-admin.js';
import { comparisonView } from '@claritas-viz/claritas-pub-lib-core';
const req = (extra={}) => ({tenantId:'tenant-a', metric:'checkins', mode:'compare', entityIds:['left','right'], start:0,end:3000,bucketMs:1000,...extra});
const row = (extra={}) => ({tenantId:'tenant-a',entityId:'left',metric:'checkins',unit:'count',at:0,value:1,consented:true,...extra});
const records = () => [row({value:0}),row({at:1000,value:10}),row({entityId:'right',value:0}),row({entityId:'right',at:1000,value:20})];
const deps = (rows=records(),extra={}) => ({minEntities:5, authorize:async()=>true,read:async()=>rows,audit:async()=>{},...extra});
const report = (rows=records(),r=req(),extra={}) => createActivityVisualization(deps(rows,extra)).report(r);
const denied = (run,code='invalid-input') => assert.rejects(run,error=>error instanceof ActivityVisualizationError && error.code===code && error.message==='Activity visualization unavailable');
test('housing calls the actual shared Claritas view with byte-identical output',async()=>{
 const out=await report();
 assert.deepEqual(out.pairedView,comparisonView([0,1000,2000],[0,10,null],[0,20,null],'Check-ins','count'));
 assert.deepEqual(out.pairedView.geometry.delta,[0,10,null]);
 assert.equal(out.charts.length,2); // Existing independent-scale outputs remain compatible.
 assert.equal(out.scale,'independent-use-comparison-table');
 assert.match(out.pairedView.svg,/Shared scale/);assert.match(out.pairedView.table,/<td>10<\/td><td>20<\/td><td>10<\/td>/);
});
test('new result round-trips ordinary JSON without changing measurements',async()=>{
 const out=await report();assert.deepEqual(JSON.parse(JSON.stringify(out)),out);
 assert.ok(Object.isFrozen(out.pairedView) && Object.isFrozen(out.pairedView.geometry.left[0][0]));
});
test('input order cannot alter comparison, SVG or table',async()=>{
 assert.deepEqual(await report(records()),await report(records().reverse()));
});
test('all missing comparison has null domain, empty geometry and unavailable table cells',async()=>{
 const out=await report([]);assert.equal(out.pairedView.geometry.domain,null);
 assert.deepEqual(out.pairedView.geometry.left,[]);assert.deepEqual(out.pairedView.geometry.delta,[null,null,null]);
 assert.match(out.pairedView.table,/unavailable/);assert.doesNotMatch(out.pairedView.svg,/NaN|Infinity/);
});
test('consent exclusion cannot reappear in paired output',async()=>{
 const out=await report([row({value:873629,consented:false}),row({entityId:'right',value:4})]);
 assert.equal(out.comparison[0].left,null);assert.equal(out.pairedView.geometry.delta[0],null);
 assert.doesNotMatch(JSON.stringify(out),/873629/);
});
test('aggregate mode does not expose a paired view or bypass small-cell suppression',async()=>{
 const out=await report([row()],req({mode:'aggregate',entityIds:[]}));
 assert.equal(out.pairedView,null);assert.equal(out.series[0].points[0].state,'suppressed');
 assert.doesNotMatch(JSON.stringify(out),/"entities":1/);
});
test('aggregate sums retain exact safe-integer behavior',async()=>{
 const rows=Array.from({length:50000},(_,i)=>row({entityId:`u${i}`,value:1e9}));
 const out=await report(rows,req({mode:'aggregate',entityIds:[]}));
 assert.equal(out.series[0].points[0].value,50000000000000);
});
test('scope stays bound to the original application',async()=>{
 let observed;await report(records(),req(),{authorize:async r=>{observed=r.application;return true;}});
 assert.equal(observed,APPLICATION_SCOPE);assert.ok(['hhaus-org','hacker-house-medellin'].includes(observed));
 await denied(()=>report(records(),req({application:'foreign'})));
});
for(const kind of ['symbol','nonenumerable','getter']) test(`request rejects ${kind} properties before authorization`,async()=>{
 const r=req();let touched=0;
 if(kind==='symbol')r[Symbol('private')]='secret';
 if(kind==='nonenumerable')Object.defineProperty(r,'private',{value:'secret'});
 if(kind==='getter')Object.defineProperty(r,'metric',{get(){touched++;return 'checkins';},enumerable:true});
 await denied(()=>report(records(),r,{authorize:async()=>{touched++;return true;}}));assert.equal(touched,0);
});
for(const kind of ['symbol','nonenumerable','getter']) test(`measurement rejects ${kind} properties`,async()=>{
 const r=row();let touched=0;
 if(kind==='symbol')r[Symbol('private')]='secret';
 if(kind==='nonenumerable')Object.defineProperty(r,'private',{value:'secret'});
 if(kind==='getter')Object.defineProperty(r,'value',{get(){touched++;return 1;},enumerable:true});
 await denied(()=>report([r]));assert.equal(touched,0);
});
test('a custom selector iterator cannot replace the two authorized IDs',async()=>{
 const ids=['left','right'];let executed=0;
 ids[Symbol.iterator]=function*(){executed++;yield 'intruder';yield 'other';};
 await denied(()=>report([],req({entityIds:ids})));assert.equal(executed,0);
});
test('selector getters are rejected without invocation',async()=>{
 const ids=['left','right'];let executed=0;
 Object.defineProperty(ids,'0',{get(){executed++;return 'left';},enumerable:true});
 await denied(()=>report([],req({entityIds:ids})));assert.equal(executed,0);
});
for(const callback of ['authorize','read','audit']) test(`${callback} typed error cannot leak mutated messages or private fields`,async()=>{
 const error=new ActivityVisualizationError('unavailable');error.message='private-secret';error.privateRecord={address:'private-secret'};
 await assert.rejects(()=>report(records(),req(),{[callback]:async()=>{throw error;}}),caught=>{
  assert.notEqual(caught,error);assert.equal(caught.message,'Activity visualization unavailable');
  assert.equal(caught.privateRecord,undefined);assert.doesNotMatch(JSON.stringify(caught),/private-secret/);return true;
 });
});
test('revocation before release prevents returning the new view',async()=>{
 let reads=0;await denied(()=>report(records(),req(),{authorize:async()=>++reads===1}),'denied');
});
test('empty successful audit is required even for a missing-data comparison',async()=>{
 let audits=0;await report([],req(),{audit:async()=>{audits++;}});assert.equal(audits,1);
});
test('equal display ranges cannot erase differences between users',async()=>{
 const out=await report([row({value:10}),row({entityId:'right',value:20})]);
 const left=out.pairedView.geometry.left[0][0],right=out.pairedView.geometry.right[0][0];
 assert.equal(left[0],right[0]);assert.notEqual(left[1],right[1]);
});
test('null-prototype plain data remains interoperable',async()=>{
 const r=Object.assign(Object.create(null),req());
 const rows=records().map(item=>Object.assign(Object.create(null),item));
 assert.deepEqual(await report(rows,r),await report());
});

test('provider error code accessors are not invoked during sanitization',async()=>{
 const error=new ActivityVisualizationError('unavailable');let calls=0;
 Object.defineProperty(error,'code',{get(){calls++;throw new Error('private-secret');}});
 await denied(()=>report([],req(),{read:async()=>{throw error;}}),'unavailable');assert.equal(calls,0);
});
