let mode = 'graph'
const navBar = document.querySelector('nav')
fetch('http://localhost:3000/albums').then(res => res.json()).then(albums => {
    albums.forEach(album => {
        console.log(albums)
        navBar.innerHTML += `<a href="#" class="album" data-id="${album.id}">${album.name}</a><br>`
    })
})

document.querySelector('#options').addEventListener('click', event => {
    console.log(event.target.innerText)
    if(event.target.innerText === 'Graph') {
        mode = 'graph'
    } else {
        mode = 'list'
    }
})

document.querySelector('#current').style.display = 'none'

navBar.addEventListener('click', (event) => {
    if(event.target.className == 'album') {
        if(document.querySelector('svg')) {
            document.querySelector('svg').remove()
        }

        document.querySelector('ul').innerHTML = ''
        if(mode == 'graph') {
            displayAlbumGraph(event.target.dataset.id)
            document.querySelector('#current').style.display = 'block'
        }
        else {
            displayAlbumList(event.target.dataset.id)
            document.querySelector('#current').style.display = 'none'
        }
    }
})


function sortProperties(obj)
{
  // convert object into array
    var sortable=[];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]
    
    // sort items by value
    sortable.sort(function(a, b)
    {
      return b[1]-a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

function displayAlbumList(id) {
    fetch(`http://localhost:3000/albums/${id}`).then(res => res.json()).then(data => {
         for (const [word, count] of sortProperties(data.histogram)) {
            let fontSize = Math.max(count, 12) * 2
            fontSize = Math.min(fontSize, 128)
            document.querySelector('ul').innerHTML += `<p style="font-size: ${fontSize}px;">${word}:${count}</p>`
         }
    })
}

function displayAlbumGraph(id) {
    fetch(`http://localhost:3000/albums/${id}`).then(res => res.json()).then(data => {
    dataset = {"children": []};
    var diameter = 700;

    var svg = d3.select("body")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");
    let countt = 0;
    // console.log(sortProperties(data.histogram))
    // console.log(Object.entries(data.histogram))
    for (const [word, count] of sortProperties(data.histogram)) {
            // const fontSize = Math.max(count, 12)
            // document.querySelector('ul').innerHTML += `<p style="font-size: ${fontSize}px;">${word}:${count}</p>`
            dataset.children.push({"Word": word, "Count": count})
    }
    // debugger
    var color = d3.scaleOrdinal(d3.schemeCategory20);


    var bubble = d3.pack(dataset)
        .size([diameter, diameter])
        .padding(3.5);


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
}    