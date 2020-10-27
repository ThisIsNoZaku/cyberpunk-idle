import jobCanProceed from "./jobCanProceed";
export default function (job, resources) {
    const requiredResources = job.consumedResources;
    const haveResources = Object.keys(requiredResources).reduce((proceed, nextResource)=>{
        const possessedQuantity = resources[nextResource] ? resources[nextResource].quantity : 0;
        return proceed && requiredResources[nextResource] <= possessedQuantity;
    },true)
    return jobCanProceed(job) && haveResources;
}