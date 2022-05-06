var width=+d3.select("#svg").attr("width")//amend width & height in html
var height=+d3.select("#svg").attr("height")

var colorScheme;
var fetchedData;
var node;
var svg=d3.select("#svg")
var cell;
var legendMarginTop=50;
var legendMargin=100;

var legend=d3.select("#legend").append("g")
        .attr("transform","translate("+legendMargin+","+legendMarginTop+")")

var treemap=d3.treemap()
        .size([width,height])
        .paddingInner(1)
        .paddingOuter(2)


d3.json("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json").then(
    data=>{
        fetchedData=data;
        update(fetchedData)
    }
)        

function update(data) {
    //sum and sort node
    node=d3.hierarchy(data)
        .sum(d=>d.value)
        .sort((a,b)=>b.value-a.value);

    treemap(node)
console.log(treemap(node));            

    //set up colorscheme
    colorScheme=d3.scaleOrdinal(data.children.map((array,index)=>d3.interpolateMagma((index+1)/data.children.length)))
   
    //data join and append treemap
    cell=svg.selectAll("g")
        .data(node.leaves())
        .enter().append("g")
          .attr("transform",d=>"translate("+d.x0+","+d.y0+")")

    cell.append("rect")
            .attr("class","tile")
            .attr("width",d=>d.x1-d.x0)
            .attr("height",d=>d.y1-d.y0)
            .style("fill",d=>colorScheme(d.data.category))
            .attr("data-name",d=>d.data.name)
            .attr("data-category",d=>d.data.category)
            .attr("data-value",d=>d.data.value)
            .on("mouseover",(d,i,nodes)=>{
                d3.select("#tooltip")
                        .attr("data-value",d.data.value)
                        .html("Name: "+d.data.name+"<br>Category: "+d.data.category+"<br>Value: "+d3.format("$,")(d.data.value))
                        .style("left",(d3.event.pageX+20)+"px")
                        .style("top",(d3.event.pageY-20)+"px")
                    .transition().duration(300)
                        .style("opacity","0.9");

                d3.select(nodes[i])
                        .style("fill","black")
                        
            })
            .on("mouseout",(d,i,nodes)=>{
                d3.select("#tooltip")
                    .transition().duration(300)
                        .style("opacity","0");

                d3.select(nodes[i])
                        .style("fill",d=>colorScheme(d.data.category)) 
            })
            .transition().duration(1500)
                .attr("opacity","1")
    
    cell.selectAll("text")
        .data(d=>d.data.name.split(/\s/g))
        .enter().append("text")
            .text(d=>d)
            .style("stroke","white")
            .style("stroke-width","0.5px")
            .style("font-size","10px")
            .attr("dy","1em")
            .attr("x","4px")
            .attr("y",(d,i)=>i*10)

    //legend data join and append

    var legendWidth=(width-legendMargin-legendMargin)/4;
    var legendHeight=20;

    var legendCell=legend.selectAll("g")
        .data(node.children)
        .enter().append("g")
            .attr("transform",(d,i)=>{
            if (i<=Math.floor(node.children.length/4)) 
            return "translate("+0+","+i*legendHeight+")";

            else if (i>Math.floor(node.children.length/4) && i<=Math.floor(node.children.length/2)) 
            return "translate("+legendWidth+","+(i-5)*legendHeight+")";

            else if (i>Math.floor(node.children.length/2) && i<=Math.floor(node.children.length*3/4))
            return "translate("+legendWidth*2+","+(i-10)*legendHeight+")";

            else (i>Math.floor(node.children.length*3/4) && i<=Math.floor(node.children.length))
            return "translate("+legendWidth*3+","+(i-15)*legendHeight+")";
        })
            
    
    legendCell.append("rect")
            .attr("class","legend-item")
            .attr("width",legendWidth-10+"")
            .attr("height",legendHeight-3+"")
            .style("fill",d=>colorScheme(d.data.name))

    legendCell.append("text")
            .text(d=>d.data.name)
            .style("stroke",(d,i)=>{
                if (i>Math.floor(node.children.length*3/4) && i<=Math.floor(node.children.length))
                return "black";
                else return "white";
            })
            .style("stroke-width","0.5px")
            .style("font-size","12px")
            .attr("dy","1em")
            .attr("x","4px")

}