import { Server } from "socket.io";

let io;

export function setupSocket(server) {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        socket.on("disconnect", () => {});
    });
}

export function notifyAppointmentCancelled(queueCode, businessId) {
    if (io) {
        console.log(`Notifying business_${businessId} about cancellation:`, queueCode);
        io.emit("appointmentCancelled", { queueCode });
    }
}

export function notifyAppointmentAdd(queueCode, businessId) {
    if (io) {
        console.log(`Notifying business_${businessId} about added:`, queueCode);
        io.emit("appointmentAdd", { queueCode });
    }
}

export { io };
