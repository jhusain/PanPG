// (event array, name array, input string, state) → [ascii-art, state]
function showEvents(a,names,str,state){var i,l,indent,name,x,out=[],output_positions=[],node,out_pos,state_was_passed
 state_was_passed=!!state
 state=state||{stack:[],indent:'',pos:0}
 for(i=0,l=a.length;i<l;i++){x=a[i]
  if(x>0){
   if(names){
    name=names[x]
    if(!name) return err('no such rule index in name array: '+x)}
   else name=''+x
   output_positions[state.stack.length]=out.length
   node={index:x,name:name,start:state.pos}
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
    out[out_pos]=show(state,y)}}
  else return err('invalid event '+x+' at position '+i)
  }
 if(state_was_passed || state.stack.length) return [out.join(''),state]
 else return out.join('')
 function err(s){return ['showEvents: '+s]}
 function show(state,node){var text=''
  if(node.end!=undefined && str){
   text='"'+str.slice(node.start,node.end)+'"'}
  return state.indent+node.name+' '+node.start+'-'+(node.end||'?')+' '+text+'\n'}}

// inspired by: http://gist.github.com/312863
function showError(pos,msg,str){var line_number,col,lines,line,start,end,prefix,suffix,arrow
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
 line=line.replace('\t',' ')
 col=pos-start
 arrow=Array(col).join('-')+'^'
 return msg+' at line '+line_number+' column '+col+'\n'+line+'\n'+arrow}

function showResult(r,names,str){
 if(r[0])return showEvents(r[1],names,str)
 return showError(r[1],r[2],str)}