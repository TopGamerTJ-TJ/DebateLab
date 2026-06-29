import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lobbyId, joinedUserSidePreference } = await req.json();
    if (!lobbyId) return Response.json({ error: 'Missing lobbyId' }, { status: 400 });

    const allLobbies = await base44.asServiceRole.entities.DebateLobby.filter({ id: lobbyId, status: "open" });
    if (allLobbies.length === 0) {
      return Response.json({ error: 'Lobby not found or already full' }, { status: 404 });
    }

    const lobby = allLobbies[0];
    if (lobby.creatorId === user.id) {
      return Response.json({ error: 'Cannot join your own lobby' }, { status: 400 });
    }

    // Assign sides
    let proPlayerId, conPlayerId, proPlayerName, conPlayerName;
    
    // Resolve side preferences
    let cPref = lobby.creatorSidePreference;
    let jPref = joinedUserSidePreference || "random";
    
    if (cPref === "random" && jPref === "random") {
      cPref = Math.random() > 0.5 ? "pro" : "con";
      jPref = cPref === "pro" ? "con" : "pro";
    } else if (cPref === "random") {
      cPref = jPref === "pro" ? "con" : "pro";
    } else if (jPref === "random") {
      jPref = cPref === "pro" ? "con" : "pro";
    } else if (cPref === jPref) {
      // Conflict, randomize
      cPref = Math.random() > 0.5 ? "pro" : "con";
      jPref = cPref === "pro" ? "con" : "pro";
    }

    if (cPref === "pro") {
      proPlayerId = lobby.creatorId;
      proPlayerName = lobby.creatorName;
      conPlayerId = user.id;
      conPlayerName = user.full_name || user.email;
    } else {
      conPlayerId = lobby.creatorId;
      conPlayerName = lobby.creatorName;
      proPlayerId = user.id;
      proPlayerName = user.full_name || user.email;
    }

    // Create match
    const match = await base44.asServiceRole.entities.DebateMatch.create({
      lobbyId: lobby.id,
      topic: lobby.topic,
      format: lobby.format,
      proPlayerId,
      proPlayerName,
      conPlayerId,
      conPlayerName,
      status: "prep",
      startedAt: new Date().toISOString(),
      prepTimeSeconds: lobby.prepTime * 60,
      timePerSideSeconds: lobby.timePerSide * 60,
      currentTurn: "pro", // Maybe wait until prep finishes? Let's say prep finishes and then it's 'pro' turn.
      isRanked: lobby.visibility === "ranked",
      spectatorIds: []
    });

    // Update lobby status
    await base44.asServiceRole.entities.DebateLobby.update(lobby.id, {
      status: "started",
      joinedUserId: user.id,
      joinedUserName: user.full_name || user.email,
      joinedUserSidePreference: jPref
    });

    return Response.json({ success: true, match });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});