
class PVWS
{
    /** Create PV Web Socket
     *  @param url URL of the PV web socket, e.g. "ws://localhost:8080/pvws/pv"
     *  @param connect_handler Called with true/false when connected/disconnected
     *  @param message_handler Called with each received message
     */
    constructor(url, connect_handler, message_handler)
    {
        this.url = url;
        this.connect_handler = connect_handler;
        this.message_handler = message_handler;
    }

    /** Open the web socket, i.e. start PV communication */
    open()
    {
        this.connect_handler(false);
        console.log("Opening " + this.url);
        this.socket = new WebSocket(this.url);
        this.socket.onopen = event => this.handleConnection();
        this.socket.onmessage = event => this.handleMessage(event.data);
        this.socket.onclose = event => this.handleClose(event);
        this.socket.onerror = event => this.handleError(event);
    }
    
    handleConnection()
    {
        console.log("Connected to " + this.url);
        this.connect_handler(true);
    }
    
    handleMessage(message)
    {
        console.log("Received Message: " + message);
        
        
        // TODO If it's a value update, use
        // Object.assign(value, update)
        // to merge new data into the existing value
        

        
        this.message_handler(JSON.parse(message));
    }

    handleError(event)
    {
        console.error("Error from " + this.url);
        console.error(event);
        this.close();
    }
    
    handleClose(event)
    {
        this.connect_handler(false);
        let message = "Web socket closed (" +  event.code ;
        if (event.reason)
            message += ", " + event.reason;
        message += ")";
        console.log(message);
        console.log("Scheduling re-connect to " +
                    this.url + " in " + this.reconnect_ms + "ms");
        setTimeout(() => this.open(), this.reconnect_ms);
    }

    /** Ask server to ping this web socket,
     *  whereupon most web clients would then reply with a 'pong'
     *  back to the server.
     */
    ping()
    {
        this.socket.send(JSON.stringify({ type: "ping" }))
    }
    
    /** Subscribe to one or more PVs
     *  @param pvs PV name or array of PV names
     */
    subscribe(pvs)
    {
        if (pvs.constructor !== Array)
            pvs = [ pvs ];
        // TODO Remember all PVs so we can re-subscribe after close/re-open
        this.socket.send(JSON.stringify({ type: "subscribe", pvs: pvs }));
    }

    /** Subscribe to one or more PVs
     *  @param pvs PV name or array of PV names
     */
    clear(pvs)
    {
        if (pvs.constructor !== Array)
            pvs = [ pvs ];
        // TODO Forget PVs so we don't re-subscribe after close/re-open
        this.socket.send(JSON.stringify({ type: "clear", pvs: pvs }));
    }
    
    /** Request list of PVs */
    list()
    {
        this.socket.send(JSON.stringify({ type: "list" }));
    }
    
    /** Close the web socket.
     * 
     *  <p>Socket will automatically re-open,
     *  similar to handling an error.
     */
    close()
    {
        this.socket.close();
    }
}

// TODO Larger timeout for production setup
PVWS.prototype.reconnect_ms = 1000;
