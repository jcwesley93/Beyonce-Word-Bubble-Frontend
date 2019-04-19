
    fetch('http://localhost:3000/albums/1').then(res => res.json()).then(data => {
        dataset = {
        "children": []
    };
        let countt = 0;
        for (const [word, count] of Object.entries(data.histogram)) {
            
                dataset.children.push({"Word": word, "Count": count})
                countt += 1
        }

        //styling of the large circle. 
        var diameter = 700;
        var color = d3.scaleOrdinal(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"]);


        var bubble = d3.pack(dataset)
            .size([diameter, diameter])
            .padding(3.5);

        var svg = d3.select("body")
            .append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");


                 var defs = svg.append("defs");

        //Filter for the outside glow
        var filter = defs.append("filter")
            .attr("id","glow");
        filter.append("feGaussianBlur")
            .attr("stdDeviation","3.5")
            .attr("result","coloredBlur");
        var feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in","coloredBlur");
        feMerge.append("feMergeNode")
            .attr("in","SourceGraphic");

        var nodes = d3.hierarchy(dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            // .style("filter", "url(#glow)")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on('mouseover', (d) => {
                document.getElementById('word').innerText = d.data.Word
                document.getElementById('count').innerText = d.data.Count
            });

    
        
        var simulation = d3.forceSimulation(dataset.children)
        
            simulation.force('charge', d3.forceManyBody().strength(1))
                .on('tick', ticked)


            function ticked() {

            var u = d3.select('svg')
                    .selectAll('circle')
                    .data(dataset.children)

                u.enter()
                    .append('circle')
                    .attr('r', 1)
                    .merge(u)
                    .attr('cx', function(d) {
                    return d.x
                    })
                    .attr('cy', function(d) {
                    return d.y
                    })

                u.exit().remove()
                }






        node.append("title")
            .text(function(d) {
                return d.data.Word + ": " + d.data.Count;
            });

        node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Word.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        d3.select(self.frameElement)
            .style("height", diameter + "px");

        })
