import { Server } from "socket.io";

let io;

export function setupSocket(server) {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
}

export function notifyAppointmentCancelled(queueCode, businessId) {
    if (io) {
        io.to(`business_${businessId}`).emit("appointmentCancelled", { queueCode });
    }
}

export { io };
