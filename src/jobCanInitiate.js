import jobCanProceed from "./jobCanProceed";
export default function (job, resources) {
    const requiredResources = job.consumedResources.get();
    const haveResources = Object.keys(requiredResources).reduce((proceed, nextResource)=>{
        const possessedQuantity = resources[nextResource] ? resources[nextResource].get().quantity.get() : 0;
        return proceed && requiredResources[nextResource].get() <= possessedQuantity;
    },true)
    return jobCanProceed(job) && haveResources;
}