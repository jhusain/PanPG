/* Utility functions on PanPG parse trees.
 * PanPG_util as of PanPG version 0.0.6
 * built on Mon, 16 Aug 2010 21:44:53 GMT
 * http://inimino.org/~inimino/blog/peg_v0.0.6
 * MIT Licensed
 */

;(function(exports){

// (event array (can be partial), [name array], [input string], [state]) → [ascii-art tree, state]
// -or-
// (complete event array, [name array], [input string]) → ascii-art
// if the event array doesn't describe a complete, finished tree, or if the state value argument is provided, then the ascii-art and the state value will be returned as an array
// this is for examining partial tree fragments as they are generated by a streaming parser

function showTree(res,opts,state){var names,str,a,i,l,indent,name,x,out=[],output_positions=[],node,out_pos,state_was_passed
 if(!res[0])return showError(res)
 res=res[1]
 names=res.names
 a=res.tree
 str=res.input
 opts=opts||{}
 opts.elide=opts.elide||['anonymous']
 opts.drop=opts.drop||[]
 state_was_passed=!!state
 state=state||{stack:[],indent:'',pos:0,drop_depth:0}
 for(i=0,l=a.length;i<l;i++){x=a[i]
  if(x>0){
   if(names){
    name=names[x]
    if(!name) return err('no such rule index in name array: '+x)}
   else name=''+x
   output_positions[state.stack.length]=out.length
   node={index:x,name:name,start:state.pos}
   if(opts.drop.indexOf(name)>-1)state.drop_depth++
   out.push(show(state,node))
   state.indent+=' '
   state.stack.push(node)}
  else if(x==-1){
   i++
   if(i==l){i--;return}
   node={name:'anonymous',start:state.pos,end:state.pos+a[i]}
   state.pos=node.end
   out.push(show(state,node))
   }
  else if(x==-2){
   i++
   if(i==l)return err('incomplete close event, expected length at position '+i+' but found end of input array')
   y=state.stack.pop()
   state.pos=y.end=y.start+a[i]
   out_pos=output_positions[state.stack.length]
   state.indent=state.indent.slice(0,-1)
   if(out_pos!=undefined){
    out[out_pos]=show(state,y)}
   if(opts.drop.indexOf(y.name)>-1)state.drop_depth--}
  else return err('invalid event '+x+' at position '+i)}
 if(state_was_passed || state.stack.length) return [out.join(''),state]
 else return out.join('')
 function err(s){return ['showTree: '+s]}
 function show(state,node){var text='',main,indent,l
  if(opts.elide.indexOf(node.name)>-1)return ''
  if(state.drop_depth)return ''
  if(node.end!=undefined && str){
   text=show_str(str.slice(node.start,node.end))}
  main=state.indent+node.name+' '+node.start+'-'+(node.end==undefined?'?':node.end)
  l=main.length
  indent=Array(32*Math.ceil((l+2)/32)-l).join(' ')
  return main+indent+text+'\n'}
 function show_str(s){
  return '»'+s.replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/(.{16}).{8,}/,"$1…")+'«'}}

// inspired by: http://gist.github.com/312863
function showError(res){var line_number,col,lines,line,start,end,prefix,suffix,arrow,pos,msg,str
 pos=res[1];msg=res[2];str=res[3]
 msg=msg||'Parse error'
 if(str==undefined)return msg+' at position '+pos
 prefix=str.slice(0,pos)
 suffix=str.slice(pos)
 line_number=prefix.split('\n').length
 start=prefix.lastIndexOf('\n')+1
 end=suffix.indexOf('\n')
 if(end==-1) end=str.length
 else end=prefix.length+end
 line=str.slice(start,end)
 line=line.replace(/\t/g,' ')
 col=pos-start
 arrow=Array(col).join('-')+'^'
 return msg+' at line '+line_number+' column '+col+'\n'+line+'\n'+arrow}

function showResult(r,opts){
 if(r[0])return showTree(r,opts)
 return showError(r)}

function treeWalker(dict,result){var p,any,anon,other,fail,except,index,cb=[],stack=[],frame,pos=0,i,l,x,retval,events,begin=[],match,target,msg
 fail=dict.fail
 except=dict.exception
 if(!result[0]){
  msg='parse failed: '+result[1]+' '+(result[2]||'')
  if(fail)return fail(result)||msg
  return err(msg)}
 result=result[1]
 names=result.names
 events=result.tree
 for(p in dict) if(dict.hasOwnProperty(p)){
  if(p=='any'){any=dict[p];throw new Error('unimplemented, use `other` instead')}
  if(p=='anonymous'||p=='anon'){anon=dict[p];continue}
  if(p=='other'){other=dict[p];continue}
  if(p=='fail'){fail=dict[p];continue}
  if(p=='exception'){except=dict[p];continue}
  if(p=='warn'){continue}
  target=cb
  if(match=/(.*) start/.exec(p)){p=m[1];target=begin}
  index=names.indexOf(p)
  if(index==-1)return err('rule not found in rule names: '+p)
  target[index]=dict[p]}
 frame={cn:[]}
 for(i=0,l=events.length;i<l;i++){x=events[i]
  if(x>0){ // named rule start
   stack.push(frame)
   frame={index:x,start:pos}
   if(begin[x]){
    try{retval=begin[x](pos)}
    // here we call err() but continue iff `except` returns true
    catch(e){if(!err('exception in '+names[x]+' start:'+e))return}}
   if(cb[x]||any||other) frame.cn=[]}
  else if(x==-1){ // anonymous node
   i++
   if(i==l)return err('incomplete anonymous node')
   if(anon)anon(m(pos,pos+events[i]))
   pos+=events[i]}
  else if(x==-2){ // node close
   i++
   if(i==l)return err('incomplete rule close')
   pos=frame.start+events[i]
   x=frame.index
   try{
    if(cb[x])     retval=cb[x](m(frame.start,pos),frame.cn)
    else if(other)retval=cb[x](m(frame.start,pos),frame.cn,names[x])}
   catch(e){return err('exception in '+names[x]+': '+e)}
   frame=stack.pop() // the parent node
   if(cb[x] && retval!==undefined)
    if(frame.cn)frame.cn.push(retval)
    else warn('ignored return value of '+names[x]+' in '+names[frame.index])}
  else return err('invalid event stream (saw '+x+' at position '+i+')')}
 if(frame.cn)return frame.cn[0]
 function m(s,e){
  return {start:s
         ,end:e
         ,text:function(){return result.input.slice(s,e)}}}
 function err(s){
  if(except)return except(s)
  throw new Error('treeWalker: '+s)}
 function warn(s){
  if(dict.warn)dict.warn(s)}}

exports.showTree=showTree
exports.treeWalker=treeWalker

})(typeof exports=='object'?exports:PanPG_util={});
