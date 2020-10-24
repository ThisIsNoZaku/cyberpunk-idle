export default function (job) {
    const assignedPersonnel = job.assignedCrew.get();
    const minRequired = job.minCrew.get();
    return assignedPersonnel.length >= minRequired;

}