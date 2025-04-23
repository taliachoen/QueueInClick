import { Server } from "socket.io";

let io;

export function setupSocket(server) {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("Client connected");

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    // שידור לכל הלקוחות כל 3 דקות
    setInterval(() => {
        if (io) {
            io.emit("refreshAvailableQueues");
            console.log("Sent refreshAvailableQueues to all clients");
        }
    }, 180000); // 3 דקות
}



export function notifyAppointmentCancelled(queueCode, businessId) {
    if (io) {
        console.log(`Notifying business_${businessId} about cancellation:`, queueCode);
        io.emit("appointmentCancelled", { queueCode });
    }
}

export const appointmentCancelledByBusiness = (queueCode, userId) => {
    io.emit("appointmentCancelledByBusiness", { queueCode, userId });
    // io.emit("appointmentCancelledByBusiness", { date: canceledDate, userId });

};



export function notifyAppointmentAdd(queueCode, businessId) {
    if (io) {
        console.log(`Notifying business_${businessId} about added:`, queueCode);
        io.emit("appointmentAdd", { queueCode });
    }
}




export { io };









