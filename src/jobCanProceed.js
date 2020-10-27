export default function (job) {
    const assignedPersonnel = job.assignedCrew;
    const minRequired = job.minCrew;
    return assignedPersonnel.length >= minRequired;

}