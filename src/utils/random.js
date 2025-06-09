/**
 * 
 * @param {number [] []} data 
 */
export function weightedRandom(data){
    const values = data.map((d) => d[0]);
    const weights = data.map((d)=> d[1]);

    const cumulativeWeights = [];
    for(let i = 0; i < weights.length; i+= 1){
        cumulativeWeights[i] = weights[i]  + (cumulativeWeights [i -1] || 0);
    }
    console.log(values, weights, cumulativeWeights);
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
    const randomNumber = maxCumulativeWeight * Math.random();

    return values[cumulativeWeights.filter((element) => element <= randomNumber).length];
}